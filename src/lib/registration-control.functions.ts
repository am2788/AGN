import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { hasAdminAccess } from "./admin";
import { REGISTRATION_STATUSES } from "./registration-control";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || !hasAdminAccess(data)) throw new Error("Admin access required.");
}

export const getRegistrationControl = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const [control, counts, log] = await Promise.all([
      context.supabase.from("registration_control").select("status,updated_at").maybeSingle(),
      context.supabase.rpc("admin_lane_entry_counts"),
      context.supabase.from("registration_control_log").select("id,status,changed_at").order("changed_at", { ascending: false }).limit(20),
    ]);
    if (control.error || counts.error || log.error) throw new Error("Registration controls could not be read. Please retry.");
    return {
      status: (control.data?.status ?? "OPEN") as (typeof REGISTRATION_STATUSES)[number],
      updatedAt: control.data?.updated_at ?? null,
      laneCounts: (counts.data ?? []).map((r) => ({ lane: r.lane, entries: Number(r.entries) })),
      log: log.data ?? [],
    };
  });

export const setRegistrationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ status: z.enum(REGISTRATION_STATUSES) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("registration_control").update({ status: data.status }).eq("id", true);
    if (error) throw new Error("Status could not be changed. Please retry.");
    return { status: data.status };
  });
