import { generateResponse } from "@lovable.dev/ai-gateway";
import { quickScreen, type ScreenResult } from "./safety-screen";

const INSTRUCTIONS = `You are a child-safety and content moderator for a gaming platform with members aged 13+.
Classify ONE chat message. Reply with JSON only: {"verdict":"allow"|"block","category":"none"|"explicit"|"grooming"|"sexual_minor"|"harassment"|"other","severity":"low"|"high","reason":"short reason"}.
Block and use "grooming" (severity high) for any attempt to lure, isolate, move to private platforms, request photos, meet in person, offer gifts for secrecy, or ask age/location in a sexualised or predatory way.
Use "sexual_minor" (high) for any sexual content involving minors. Use "explicit" for sexual or pornographic content or links to it. Allow normal gaming banter and trash talk.`;

// Fails closed: if the screen can't run, the message is held rather than delivered.
export async function screenMessage(body: string): Promise<ScreenResult> {
  const quick = quickScreen(body);
  if (quick.verdict === "block") return quick;
  try {
    const res = await generateResponse({ model: "openai/gpt-6-astra", instructions: INSTRUCTIONS, input: body });
    let text = "";
    for (const item of res.output ?? []) {
      if (item.type === "message") for (const c of item.content) if (c.type === "output_text") text += c.text;
    }
    const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as Partial<ScreenResult>;
    if (json.verdict === "allow") return { verdict: "allow", category: "none", severity: "low", reason: "" };
    return {
      verdict: "block",
      category: typeof json.category === "string" ? json.category : "other",
      severity: json.severity === "low" ? "low" : "high",
      reason: typeof json.reason === "string" ? json.reason.slice(0, 300) : "Flagged by safety screen",
    };
  } catch (error) {
    console.error("Safety screen unavailable", error);
    return { verdict: "hold", category: "screen_unavailable", severity: "low", reason: "Safety screen unavailable" };
  }
}
