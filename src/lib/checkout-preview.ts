import { TOURNAMENT_PRICES } from "./tournament-entry";

export type CheckoutFormat = "solo" | "team";
export type CheckoutPlan = "full" | "installment";
export const INSTALLMENT_WEEKS = 8;
export const INSTALLMENT_WEEKLY_CENTS = { solo: 5000, team: 27500 } as const;
export function checkoutPreviewQuote(format: CheckoutFormat, plan: CheckoutPlan) {
  const full = TOURNAMENT_PRICES.franchise[format];
  const weekly = INSTALLMENT_WEEKLY_CENTS[format];
  return { dueTodayCents: plan === "full" ? full : weekly, totalCents: plan === "full" ? full : weekly * INSTALLMENT_WEEKS, payments: plan === "full" ? 1 : INSTALLMENT_WEEKS, paymentEnabled: false, securityVerified: false, registrationActivated: false } as const;
}