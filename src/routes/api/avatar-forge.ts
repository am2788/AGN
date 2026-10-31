import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
export const Route = createFileRoute("/api/avatar-forge")({ server: { handlers: { POST: async ({ request }) => {
  const url = process.env["SUPABASE_URL"], key = process.env["SUPABASE_PUBLISHABLE_KEY"], apiKey = process.env["LOVABLE_API_KEY"];
  if (!url || !key || !apiKey) return Response.json({ message: "Avatar Forge is not configured." }, { status: 500 });
  const { authenticateAvatarRequest } = await import("@/lib/avatar-auth.server");
  const auth = await authenticateAvatarRequest(request, url, key);
  if (!auth) return Response.json({ message: "Sign in to use Avatar Forge." }, { status: 401 });
  const { data: rewards, error } = await auth.client.from("participant_rewards").select("points").eq("user_id", auth.userId).single();
  if (error || !rewards || rewards.points < 10000) return Response.json({ message: "Avatar Forge unlocks at Master: 10,000 engagement points." }, { status: 403 });
  const body = z.object({ prompt: z.string().trim().min(3).max(1500), stream: z.boolean().default(true) }).safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ message: "Enter an avatar vision between 3 and 1,500 characters." }, { status: 400 });
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const generationId = crypto.randomUUID();
  const { error: lockError } = await supabaseAdmin.from("avatar_forge_blocks").insert({ user_id: auth.userId, status_code: 409, reason: "A generation is pending or paused. Restore service access before starting another.", generation_id: generationId, prompt: body.data.prompt });
  if (lockError) return Response.json({ message: "Avatar Forge is paused or already generating. Account review is required before another request." }, { status: 409 });
  const { generateImage } = await import("@/lib/image-gateway.server");
  const upstream = await generateImage({ baseURL: "https://ai.gateway.lovable.dev", apiKey, model: "google/gemini-3-pro-image", format: "gemini-chat" }, `Create one original square profile avatar, centered and sharply detailed, no lettering. Avatar vision: ${body.data.prompt}`, body.data.stream);
  if (!upstream.ok) {
    const text = await upstream.text();
    let reason = "Avatar generation is unavailable.";
    try { const parsed = JSON.parse(text); reason = parsed.message ?? parsed.error?.message ?? reason; } catch { /* No unsafe upstream body exposed. */ }
    await supabaseAdmin.from("avatar_forge_blocks").update({ status_code: upstream.status, reason }).eq("user_id", auth.userId);
    return Response.json({ message: reason }, { status: upstream.status });
  }
  return new Response(upstream.body, { status: upstream.status, headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json", "Cache-Control": "no-store", "X-Avatar-Generation": generationId } });
} } } });