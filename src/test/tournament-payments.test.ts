import { describe, expect, it } from "vitest";
import { canStartPayment, entryPriceId, installmentCancelAt } from "@/lib/tournament-payments";

describe("tournament payments", () => {
  it("solo franchise full maps to the $375 price", () => expect(entryPriceId(2, "franchise", "full")).toBe("franchise_solo_full"));
  it("team franchise installment maps to the weekly $275 plan", () => expect(entryPriceId(1, "franchise", "installment")).toBe("franchise_team_installment"));
  it("weekly entries cannot use installments", () => expect(() => entryPriceId(1, "weekly", "installment")).toThrow());
  it("installment plans stop after exactly 8 weekly charges", () => {
    const end = installmentCancelAt(0);
    expect(end > 7 * 7 * 86400 && end < 8 * 7 * 86400).toBe(true);
  });
  it("paid entries cannot start a new checkout", () => {
    expect(canStartPayment("paid")).toBe(false);
    expect(canStartPayment("installments_active")).toBe(false);
    expect(canStartPayment("not_started")).toBe(true);
  });
});

import { availableUpgrade, payoffCents, seatConfirmed, statusForSubscription } from "@/lib/tournament-payments";
describe("purchase business rules", () => {
  it("a missed weekly payment holds the seat while retrying", () => {
    expect(statusForSubscription("past_due")).toBe("past_due");
    expect(seatConfirmed("past_due")).toBe(true);
  });
  it("exhausted retries release the seat", () => expect(statusForSubscription("unpaid")).toBe("failed"));
  it("weekly pass can upgrade to season pass", () => expect(availableUpgrade("paid", "weekly")).toBe("to_franchise"));
  it("8-week plan can be paid off early", () => expect(availableUpgrade("installments_active", "franchise")).toBe("payoff"));
  it("a fully paid season pass has no downgrade or cancel option", () => expect(availableUpgrade("paid", "franchise")).toBeNull());
  it("team payoff after 3 payments is 5 × $275", () => expect(payoffCents(1, 3)).toBe(137500));
});
