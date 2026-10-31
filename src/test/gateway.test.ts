import { describe, expect, it } from "vitest";
import { GATEWAY_TIERS, gatewayPreview, gatewaySelection } from "@/lib/gateway";

describe("gateway selection", () => {
  it.each([["bronze", 500], ["silver", 1000], ["gold", 2500], ["platinum", 5000], ["diamond", 10000], ["legendary", 25000]])("quotes %s at %i cents", (id, fee) => {
    expect(gatewaySelection(id).feeCents).toBe(fee);
  });
  it("defaults to the $25 Gold gateway", () => {
    expect(gatewaySelection("unknown")).toEqual({ id: "gold", label: "Gold", feeCents: 2500 });
  });
  it("does not double the initial payment for the proposed 2X prize preview", () => {
    expect(gatewayPreview("gold")).toMatchObject({ initialFeeCents: 2500, proposedPrizeMultiplier: 2 });
  });
  it("cannot grant identity verification or enable payment from a tier selection", () => {
    for (const tier of GATEWAY_TIERS) expect(gatewayPreview(tier.id)).toMatchObject({ identityVerified: false, paymentEnabled: false });
  });
});