import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const uuid = z.string().uuid();

export const listConnections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("my_connections");
    if (error) throw new Error("Friends could not be loaded.");
    return data ?? [];
  });

export const getOfficialAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("official_account_id");
    return { id: (data as string | null) ?? null };
  });

export const searchMembers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ q: z.string().trim().min(2).max(40) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.rpc("search_members", { _q: data.q });
    if (error) throw new Error("Search failed.");
    return rows ?? [];
  });

export const sendFriendRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ to: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("friendships").insert({ requester_id: context.userId, addressee_id: data.to });
    if (error) throw new Error(error.code === "23505" ? "You're already connected or a request is pending." : "Request could not be sent.");
    return { ok: true };
  });

export const answerFriendRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: uuid, accept: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("friendships").update({ status: data.accept ? "accepted" : "declined" }).eq("id", data.id);
    if (error) throw new Error("Request could not be updated.");
    return { ok: true };
  });

export const listMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ with: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    const me = context.userId;
    const { data: rows, error } = await context.supabase.from("direct_messages")
      .select("id, sender_id, body, created_at")
      .or(`and(sender_id.eq.${me},recipient_id.eq.${data.with}),and(sender_id.eq.${data.with},recipient_id.eq.${me})`)
      .order("created_at", { ascending: true }).limit(200);
    if (error) throw new Error("Messages could not be loaded.");
    return rows ?? [];
  });

export const sendDirectMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ to: uuid, body: z.string().trim().min(1).max(1000) }).parse(d))
  .handler(async ({ data, context }) => {
    const me = context.userId;
    const { data: ban } = await context.supabase.from("platform_bans").select("user_id").eq("user_id", me).maybeSingle();
    if (ban) throw new Error("This account can no longer send messages.");
    const { data: official } = await context.supabase.rpc("official_account_id");
    if (official && data.to === official) throw new Error("AGN welcome messages are automated — replies are turned off.");
    const { data: friendship } = await context.supabase.from("friendships").select("id")
      .eq("status", "accepted")
      .or(`and(requester_id.eq.${me},addressee_id.eq.${data.to}),and(requester_id.eq.${data.to},addressee_id.eq.${me})`)
      .maybeSingle();
    if (!friendship) throw new Error("You can only message friends.");

    const { screenMessage } = await import("./safety-screen.server");
    const result = await screenMessage(data.body);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (result.verdict !== "allow") {
      // Quietly held for human review; the sender sees a neutral notice.
      await supabaseAdmin.from("safety_flags").insert({
        sender_id: me, recipient_id: data.to, channel: "direct", body: data.body,
        category: result.category, severity: result.severity, ai_reason: result.reason,
        fingerprint: {
          user_id: me,
          ip: getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for") ?? null,
          user_agent: getRequestHeader("user-agent") ?? null,
          country: getRequestHeader("cf-ipcountry") ?? null,
          captured_at: new Date().toISOString(),
        },
      });
      return { delivered: false as const };
    }
    const { error } = await supabaseAdmin.from("direct_messages").insert({ sender_id: me, recipient_id: data.to, body: data.body });
    if (error) throw new Error("Message could not be sent.");
    return { delivered: true as const };
  });

// Admin safety queue
async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (data !== true) throw new Error("Admin access required.");
}

export const listSafetyFlags = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [{ data: flags }, { data: reports }] = await Promise.all([
      context.supabase.from("safety_flags").select("id, sender_id, recipient_id, body, category, severity, ai_reason, fingerprint, status, created_at").order("created_at", { ascending: false }).limit(100),
      context.supabase.from("authority_reports").select("id, flag_id, user_id, status, created_at").order("created_at", { ascending: false }).limit(50),
    ]);
    return { flags: flags ?? [], reports: reports ?? [] };
  });

export const reviewSafetyFlag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: uuid, decision: z.enum(["dismissed", "banned"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("review_safety_flag", { _flag_id: data.id, _decision: data.decision });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
