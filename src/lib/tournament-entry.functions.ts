import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { tournamentQuote, tournamentRegistrationSchema } from "./tournament-entry";
import { REGISTRATION_CLOSED_MESSAGE } from "./registration-control";

export const registerTournament = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => tournamentRegistrationSchema.parse(input))
  .handler(async ({ data, context }) => {
    const quote = tournamentQuote(data.lane, data.pricingOption);
    const { data: existing, error: readError } = await context.supabase.from("tournament_registrations")
      .select("id,callsign,lane,pricing_option,quoted_fee_cents,payment_status")
      .eq("user_id", context.userId).eq("lane", data.lane).maybeSingle();
    if (readError) throw new Error("Could not read your registration. Please retry.");
    if (existing) return { registration: existing, alreadyRegistered: true };
    const { data: registration, error } = await context.supabase.from("tournament_registrations").insert({
      user_id: context.userId, callsign: data.callsign, lane: data.lane,
      pricing_option: data.pricingOption, quoted_fee_cents: quote.feeCents, terms_accepted: true,
    }).select("id,callsign,lane,pricing_option,quoted_fee_cents,payment_status").single();
    if (error?.message?.includes("REGISTRATION_NOT_OPEN")) throw new Error(REGISTRATION_CLOSED_MESSAGE);
    if (error || !registration) throw new Error("Could not save your registration. Please retry.");
    return { registration, alreadyRegistered: false };
  });