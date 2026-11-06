import { describe, expect, it } from "vitest";
import { skinAspect, skinAssetUrl, shouldUse4k } from "../../src/lib/skins/registry";
import { clampEqGain, clampOutputBoost } from "../../src/lib/audio/eq-engine";

describe("skin asset resolution", () => {
  it("selects 4K desktop shell assets for supported high-DPI screens", () => {
    expect(shouldUse4k("gold", "signup", "desk", 2)).toBe(true);
    expect(skinAssetUrl({ skin: "gold", device: "desk", screen: "signup", layer: "shell", hiRes: true, cdnBase: "https://cdn.example" }))
      .toBe("https://cdn.example/gold/desk/gold-desk-signup-shell-4k.png");
    expect(shouldUse4k("cyber", "signup", "desk", 2)).toBe(false);
  });

  it("uses square desktop Overchat and portrait mobile stages", () => {
    expect(skinAspect("overchat", "desk")).toBe(1);
    expect(skinAspect("overchat", "mob")).toBe(9 / 16);
  });
});

describe("audio safety limits", () => {
  it("clamps EQ gains to -18..18 dB", () => {
    expect(clampEqGain(-100)).toBe(-18);
    expect(clampEqGain(100)).toBe(18);
  });

  it("clamps output boost to 0..200 percent", () => {
    expect(clampOutputBoost(-1)).toBe(0);
    expect(clampOutputBoost(3)).toBe(2);
  });
});
