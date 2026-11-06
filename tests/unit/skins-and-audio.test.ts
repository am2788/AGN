import { describe, expect, it } from "vitest";
import { skinAspect, skinAssetUrl, shouldUse4k } from "../../src/lib/skins/registry";
import { clampEqGain, clampOutputBoost } from "../../src/lib/audio/eq-engine";
import { readSessionCookie, sessionCookie } from "../../src/lib/auth/xano.server";

describe("skin resolution", () => {
  it("resolves high-DPI desktop shell and theme screens", () => {
    expect(shouldUse4k("gold", "signup", "desk", 2)).toBe(true);
    expect(skinAssetUrl({ skin: "gold", device: "desk", screen: "signup", layer: "shell", hiRes: true, cdnBase: "https://cdn.example/" })).toBe("https://cdn.example/gold/desk/gold-desk-signup-shell-4k.png");
    expect(shouldUse4k("cyber", "signup", "desk", 2)).toBe(false);
  });
  it("sets Overchat square desktop and mobile 9:16 ratios", () => {
    expect(skinAspect("overchat", "desk")).toBe(1);
    expect(skinAspect("overchat", "mob")).toBe(9 / 16);
  });
});

describe("EQ bounds", () => {
  it("clamps bands to -18..18 dB and boost to 0..200%", () => {
    expect(clampEqGain(-100)).toBe(-18);
    expect(clampEqGain(100)).toBe(18);
    expect(clampOutputBoost(-1)).toBe(0);
    expect(clampOutputBoost(3)).toBe(2);
  });
});

describe("session cookies", () => {
  it("uses HttpOnly, SameSite=Lax and Secure defaults", () => {
    const cookie = sessionCookie("private-token");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Secure");
    expect(readSessionCookie(cookie)).toBe("private-token");
  });
});
