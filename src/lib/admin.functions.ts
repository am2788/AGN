import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { hasAdminAccess } from "./admin";

const snapshotSchema = z.object({
  checkedAt: z.string(), accounts: z.number(), players: z.number(), viewers: z.number(),
  registrations: z.number(), pausedAvatarRequests: z.number(),
});

export const getAdminMonitoring = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: role, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (error || !hasAdminAccess(role)) return { allowed: false as const, snapshot: null };
    const start = performance.now();
    const { data, error: snapshotError } = await context.supabase.rpc("admin_monitoring_snapshot");
    if (snapshotError) throw new Error("Monitoring data could not be read. Please retry.");
    return { allowed: true as const, snapshot: { ...snapshotSchema.parse(data), databaseRoundTripMs: Math.round(performance.now() - start) } };
  });