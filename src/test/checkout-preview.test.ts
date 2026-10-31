import { describe, expect, it } from "vitest";
import { checkoutPreviewQuote } from "@/lib/checkout-preview";
import { tournamentQuote } from "@/lib/tournament-entry";

describe("checkout tunnel pricing", () => {
  it("quotes Solo full payment at $375 once", () => { expect(checkoutPreviewQuote("solo", "full")).toMatchObject({ dueTodayCents: 37500, totalCents: 37500, payments: 1 }); });
  it("quotes Teams full payment at $1,875 once", () => { expect(checkoutPreviewQuote("team", "full")).toMatchObject({ dueTodayCents: 187500, totalCents: 187500, payments: 1 }); });
  it("quotes Solo at $50 weekly for 8 weeks, $400 total", () => { expect(checkoutPreviewQuote("solo", "installment")).toMatchObject({ dueTodayCents: 5000, totalCents: 40000, payments: 8 }); });
  it("quotes Teams at $275 weekly for 8 weeks, $2,200 total", () => { expect(checkoutPreviewQuote("team", "installment")).toMatchObject({ dueTodayCents: 27500, totalCents: 220000, payments: 8 }); });
  it("preserves the separate $250 flexible weekly team registration price", () => { expect(tournamentQuote(1, "weekly").feeCents).toBe(25000); });
  it("does not activate payment, security or registration from a visual state", () => { for (const format of ["solo", "team"] as const) for (const plan of ["full", "installment"] as const) expect(checkoutPreviewQuote(format, plan)).toMatchObject({ paymentEnabled: false, securityVerified: false, registrationActivated: false }); });
});