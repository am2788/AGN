import { describe, expect, it } from "vitest";
import { bridgeCycleStandings, tournamentQuote, tournamentRegistrationSchema } from "@/lib/tournament-entry";

describe("tournament entry rules", () => {
  it("charges $375 upfront for solo lanes", () => { for (const lane of [2, 6]) expect(tournamentQuote(lane, "franchise").feeCents).toBe(37500); });
  it("charges $1,875 upfront for team lanes", () => { for (const lane of [1, 3, 4, 5]) expect(tournamentQuote(lane, "franchise").feeCents).toBe(187500); });
  it("quotes $50 weekly for solo lanes", () => { for (const lane of [2, 6]) expect(tournamentQuote(lane, "weekly").feeCents).toBe(5000); });
  it("quotes $250 weekly for team lanes", () => { for (const lane of [1, 3, 4, 5]) expect(tournamentQuote(lane, "weekly").feeCents).toBe(25000); });
  it("does not invent tournament vault allocations or monthly adjustments", () => {
    for (const option of ["franchise", "weekly"] as const) expect(tournamentQuote(2, option)).toMatchObject({ vaultCents: null, monthlyAdjustmentCents: null });
  });
  it("allows tournament registration without an adult age gate", () => {
    expect(tournamentRegistrationSchema.safeParse({ callsign: "YOUNG_PLAYER", lane: 2, pricingOption: "weekly", termsAccepted: true }).success).toBe(true);
  });
  it("requires tournament terms", () => {
    expect(tournamentRegistrationSchema.safeParse({ callsign: "PLAYER", lane: 2, pricingOption: "weekly", termsAccepted: false }).success).toBe(false);
  });
  it("keeps standings unchanged through a cross-month Bridge Cycle", () => {
    const standings = [{ callsign: "ACE", wins: 7, points: 21 }, { callsign: "TWO", wins: 4, points: 12 }];
    expect(bridgeCycleStandings(standings)).toEqual([{ callsign: "ACE", wins: 7, points: 21 }, { callsign: "TWO", wins: 4, points: 12 }]);
  });
});