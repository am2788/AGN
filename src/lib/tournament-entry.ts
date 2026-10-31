import { z } from "zod";

export const TOURNAMENT_PRICES = {
  franchise: { solo: 37500, team: 187500 },
  weekly: { solo: 5000, team: 25000 },
} as const;
export type PricingOption = keyof typeof TOURNAMENT_PRICES;
export const tournamentRegistrationSchema = z.object({
  callsign: z.string().trim().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/, "Use letters, numbers and underscores."),
  lane: z.number().int().min(1).max(6),
  pricingOption: z.enum(["franchise", "weekly"]),
  termsAccepted: z.literal(true, { message: "Accept the tournament terms to continue." }),
});
export function tournamentQuote(lane: number, option: PricingOption) {
  const format = lane === 2 || lane === 6 ? "solo" : "team";
  return { format, feeCents: TOURNAMENT_PRICES[option][format], vaultCents: null, monthlyAdjustmentCents: null };
}

/** Bridge cycles preserve the authoritative standings rather than creating a monthly reset. */
export function bridgeCycleStandings<T>(standings: readonly T[]): readonly T[] {
  return standings;
}
export const BRIDGE_CYCLE_NOTE = "Bridge Cycle · During five-week months, cross-month matches continue seamlessly. Standings carry over without resetting.";
export const TOURNAMENT_AGE_NOTE = "Tournament entry is open to all ages. The 18+ ID verification and jurisdiction compliance check apply strictly to the Wager & Betting Vault.";