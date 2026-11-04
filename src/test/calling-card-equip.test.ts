import { describe, expect, it } from "vitest";
import { CALLING_CARD_ARTWORK, CARD_TIER_LABELS, getArtworkByKey, isEquippableCard } from "@/lib/calling-card-artwork";

describe("calling-card collection", () => {
  it("keeps stable unique keys for every catalog entry", () => {
    const keys = CALLING_CARD_ARTWORK.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const key of keys) expect(key).toMatch(/^[a-z0-9-]+$/);
  });

  it("treats every current catalog card as an entry-level standard choice", () => {
    expect(CALLING_CARD_ARTWORK.length).toBeGreaterThan(0);
    for (const card of CALLING_CARD_ARTWORK) expect(card.tier).toBe("standard");
  });

  it("resolves artwork by stable key and returns undefined for unknown keys", () => {
    const first = CALLING_CARD_ARTWORK[0]!;
    expect(getArtworkByKey(first.key)?.url).toBe(first.url);
    expect(getArtworkByKey("does-not-exist")).toBeUndefined();
    expect(getArtworkByKey(null)).toBeUndefined();
    expect(getArtworkByKey(undefined)).toBeUndefined();
  });

  it("allows equipping standard cards and rejects unknown or premium keys", () => {
    for (const card of CALLING_CARD_ARTWORK) expect(isEquippableCard(card.key)).toBe(true);
    expect(isEquippableCard("first-strike")).toBe(false); // exclusive, never equippable from a preview
    expect(isEquippableCard("")).toBe(false);
    expect(isEquippableCard("premium-ghost")).toBe(false);
  });

  it("labels tiers without exposing payment or entitlement details", () => {
    expect(CARD_TIER_LABELS.standard).toBe("Standard");
    expect(CARD_TIER_LABELS["premium-static"]).toBe("Premium");
    expect(CARD_TIER_LABELS["premium-motion"]).toBe("Premium Motion");
    for (const label of Object.values(CARD_TIER_LABELS)) {
      expect(label.toLowerCase()).not.toMatch(/paid|purchased|stripe|price|\$/);
    }
  });
});
