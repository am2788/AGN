/** Gateway presentation tiers are independent of engagement ranks and legacy wager IDs. */
export const GATEWAY_TIERS = [
  { id: "bronze", label: "Bronze", feeCents: 500 },
  { id: "silver", label: "Silver", feeCents: 1000 },
  { id: "gold", label: "Gold", feeCents: 2500 },
  { id: "platinum", label: "Platinum", feeCents: 5000 },
  { id: "diamond", label: "Diamond", feeCents: 10000 },
  { id: "legendary", label: "Legendary", feeCents: 25000 },
] as const;
export type GatewayTierId = (typeof GATEWAY_TIERS)[number]["id"];
export function gatewaySelection(id: string) {
  return GATEWAY_TIERS.find((tier) => tier.id === id) ?? GATEWAY_TIERS[2];
}
export function gatewayPreview(id: GatewayTierId) {
  return { initialFeeCents: gatewaySelection(id).feeCents, proposedPrizeMultiplier: 2, paymentEnabled: false, identityVerified: false } as const;
}