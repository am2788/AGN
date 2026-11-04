import { describe, expect, it } from "vitest";
import { CALLING_CARD_MOTION, getMotionCardByKey } from "@/lib/calling-card-motion";
import { isEquippableCard } from "@/lib/calling-card-artwork";

describe("premium motion calling cards", () => {
  it("keeps stable unique keys for every motion card", () => {
    const keys = CALLING_CARD_MOTION.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const key of keys) expect(key).toMatch(/^[a-z0-9-]+$/);
  });

  it("carries both a poster and a looping clip for every card", () => {
    expect(CALLING_CARD_MOTION.length).toBe(7);
    for (const card of CALLING_CARD_MOTION) {
      expect(card.tier).toBe("premium-motion");
      expect(card.videoUrl).toMatch(/^\/__l5e\/assets-v1\/.+\.mp4$/);
      expect(card.posterUrl).toMatch(/^\/__l5e\/assets-v1\/.+\.jpg$/);
      expect(card.videoUrl).not.toBe(card.posterUrl);
    }
  });

  it("never lets a motion card be equipped", () => {
    for (const card of CALLING_CARD_MOTION) expect(isEquippableCard(card.key)).toBe(false);
  });

  it("resolves motion cards by key and returns undefined for unknown keys", () => {
    const first = CALLING_CARD_MOTION[0]!;
    expect(getMotionCardByKey(first.key)?.name).toBe(first.name);
    expect(getMotionCardByKey("does-not-exist")).toBeUndefined();
    expect(getMotionCardByKey(null)).toBeUndefined();
  });
});
