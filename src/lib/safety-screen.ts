export type ScreenResult = {
  verdict: "allow" | "block" | "hold";
  category: string;
  severity: "low" | "high";
  reason: string;
};

// Fast first pass before the AI check. Grooming phrases are always high severity.
const GROOMING = [
  /\b(how old|what'?s your age|are you (13|14|15|16|17))\b.*\b(alone|secret|pic|photo|meet)\b/i,
  /\b(don'?t|do not) tell (your )?(mom|mum|dad|parents?|anyone)\b/i,
  /\b(send|show) (me )?(a )?(pic|pics|photo|nudes?|body)\b/i,
  /\b(our little secret|keep (this|it) (a )?secret)\b/i,
  /\b(snap|kik|telegram|whatsapp|discord dm)\b.*\b(private|alone|secret)\b/i,
  /\bmeet (up )?(irl|in person)\b.*\b(alone|secret|don'?t tell)\b/i,
];
const EXPLICIT = [/\b(nudes?|porn|onlyfans|nsfw|sext)\b/i];

export function quickScreen(body: string): ScreenResult {
  if (GROOMING.some((r) => r.test(body))) return { verdict: "block", category: "grooming", severity: "high", reason: "Matched grooming pattern" };
  if (EXPLICIT.some((r) => r.test(body))) return { verdict: "block", category: "explicit", severity: "low", reason: "Matched explicit content pattern" };
  return { verdict: "allow", category: "none", severity: "low", reason: "" };
}
