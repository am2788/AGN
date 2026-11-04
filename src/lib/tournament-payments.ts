// Maps a saved registration + plan to a catalog price. The server decides the
// price from the stored registration, never from client-sent amounts.
export type PaymentPlan = "full" | "installment";
export const INSTALLMENT_COUNT = 8;
export const INSTALLMENT_WEEKLY_CENTS = { solo: 5000, team: 27500 } as const;

export function laneFormat(lane: number) {
  return lane === 2 || lane === 6 ? "solo" : "team";
}

export function entryPriceId(lane: number, pricingOption: string, plan: PaymentPlan): string {
  const format = laneFormat(lane);
  if (pricingOption === "weekly") {
    if (plan !== "full") throw new Error("Weekly entries are paid one week at a time.");
    return `weekly_${format}`;
  }
  if (pricingOption !== "franchise") throw new Error("Unknown pricing option");
  return plan === "full" ? `franchise_${format}_full` : `franchise_${format}_installment`;
}

export const PAYABLE_STATUSES = ["not_started", "pending", "failed"] as const;
export function canStartPayment(status: string) {
  return (PAYABLE_STATUSES as readonly string[]).includes(status);
}

/** Upgrades only: weekly → season pass, or 8-week plan → pay off the rest. Never downgrades or cancels. */
export type Upgrade = "to_franchise" | "payoff" | null;
export function availableUpgrade(status: string, pricingOption: string): Upgrade {
  if (pricingOption === "weekly" && status === "paid") return "to_franchise";
  if (pricingOption === "franchise" && (status === "installments_active" || status === "past_due")) return "payoff";
  return null;
}

/** Remaining balance on an 8-week plan after `paidCount` weekly charges. */
export function payoffCents(lane: number, paidCount: number) {
  const remaining = Math.max(0, INSTALLMENT_COUNT - paidCount);
  return remaining * INSTALLMENT_WEEKLY_CENTS[laneFormat(lane)];
}

/** Cancel point that yields exactly 8 weekly charges (week 0 through week 7). */
export function installmentCancelAt(startUnix: number) {
  return startUnix + (INSTALLMENT_COUNT - 1) * 7 * 86400 + 86400;
}

/** Statuses that confirm a seat. A missed weekly payment keeps the seat while it retries. */
export const SEAT_CONFIRMED = ["paid", "installments_active", "past_due", "installments_complete"] as const;
export function seatConfirmed(status: string) {
  return (SEAT_CONFIRMED as readonly string[]).includes(status);
}

/** Subscription status → registration status. Players cannot cancel; only exhausted retries drop the seat. */
export function statusForSubscription(subStatus: string): string | null {
  if (subStatus === "active") return "installments_active";
  if (subStatus === "past_due") return "past_due";
  if (subStatus === "unpaid") return "failed";
  return null;
}

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  not_started: "Payment not started",
  pending: "Payment processing",
  paid: "Paid · seat confirmed",
  installments_active: "8-week plan active · seat confirmed",
  past_due: "Weekly payment retrying · seat held",
  installments_complete: "8-week plan complete · seat confirmed",
  failed: "Payment failed · seat released",
};
