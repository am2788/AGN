import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { profileSchema, cosmeticUnlocks } from "./participant";

export const getParticipantAccount = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const [profile, rewards, entries] = await Promise.all([
    context.supabase.from("profiles").select("id,display_name,participant_type,leaderboard_visible,avatar_key,accent_key,font_key").eq("id", context.userId).single(),
    context.supabase.from("participant_rewards").select("points,rank_name,bracket_wins,bracket_stage").eq("user_id", context.userId).single(),
    context.supabase.from("tournament_registrations").select("id,callsign,lane,pricing_option,quoted_fee_cents,payment_status,created_at").eq("user_id", context.userId).order("created_at", { ascending: false }),
  ]);
  if (profile.error || rewards.error || entries.error) throw new Error("Could not load your account. Please retry.");
  const { data: avatar } = await context.supabase.from("participant_avatars").select("storage_path").eq("user_id", context.userId).maybeSingle();
  const avatarUrl = avatar ? (await context.supabase.storage.from("participant-avatars").createSignedUrl(avatar.storage_path, 300)).data?.signedUrl ?? null : null;
  return { profile: profile.data, rewards: rewards.data, entries: entries.data, avatarUrl };
});
export const updateParticipantProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => profileSchema.parse(input)).handler(async ({ data, context }) => {
    const { data: rewards } = await context.supabase.from("participant_rewards").select("points").eq("user_id",context.userId).single();
    const unlocks = cosmeticUnlocks(rewards?.points ?? 0);
    if (!unlocks.accents && data.accent_key !== "crimson") throw new Error("Accent colors unlock at 500 points.");
    if (!unlocks.typography && data.font_key !== "body") throw new Error("Typography unlocks at 2,000 points.");
    const { error } = await context.supabase.from("profiles").update(data).eq("id", context.userId);
    if (error) throw new Error("Could not save your profile.");
    return { saved: true };
  });
export const getParticipantLeaderboard = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: profiles, error } = await context.supabase.from("profiles").select("id,display_name,participant_type,avatar_key,accent_key,font_key").eq("leaderboard_visible", true).limit(100);
  if (error) throw new Error("Could not load the leaderboard.");
  if (!profiles.length) return [];
  const { data: rewards, error: rewardError } = await context.supabase.from("participant_rewards").select("user_id,points,rank_name,bracket_wins,bracket_stage").in("user_id", profiles.map((p) => p.id));
  if (rewardError) throw new Error("Could not load participant rewards.");
  return profiles.map((p) => ({ ...p, points: rewards.find((r) => r.user_id === p.id)?.points ?? 0, rank: rewards.find((r) => r.user_id === p.id)?.rank_name ?? "recruit" , bracketWins: rewards.find((r) => r.user_id === p.id)?.bracket_wins ?? 0, bracketStage: rewards.find((r) => r.user_id === p.id)?.bracket_stage ?? 0 })).sort((a, b) => b.points - a.points || a.display_name.localeCompare(b.display_name));
});
export const saveForgedAvatar = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
.inputValidator((input: unknown) => z.object({ image: z.string().max(14000000).regex(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/) }).parse(input))
.handler(async ({ data, context }) => {
 const { data: reward } = await context.supabase.from("participant_rewards").select("points").eq("user_id",context.userId).single();
 if (!reward || reward.points < 10000) throw new Error("Avatar Forge requires 10,000 points.");
 const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
 const { data: pending } = await supabaseAdmin.from("avatar_forge_blocks").select("generation_id,prompt,status_code").eq("user_id",context.userId).single();
 if (!pending?.generation_id || pending.status_code !== 409 || !pending.prompt) throw new Error("No pending avatar generation can be saved.");
 const bytes = Uint8Array.from(atob(data.image.split(",")[1] ?? ""), (c) => c.charCodeAt(0));
 if (bytes.length < 8 || bytes[0] !== 137 || bytes[1] !== 80 || bytes[2] !== 78 || bytes[3] !== 71) throw new Error("Invalid avatar image.");
 const path = `${context.userId}/${pending.generation_id}.png`;
 const { error: uploadError } = await supabaseAdmin.storage.from("participant-avatars").upload(path, bytes, { contentType:"image/png",upsert:true });
 if (uploadError) throw new Error("Could not store your avatar. Please contact the event organizer.");
 const { error } = await supabaseAdmin.from("participant_avatars").upsert({ user_id:context.userId,storage_path:path,prompt:pending.prompt,updated_at:new Date().toISOString() });
 if (error) throw new Error("Could not save your avatar profile.");
 // Keep the durable lock until the organizer verifies the provider run; a client cannot clear a denial by submitting an image.
 return { saved:true };
});
