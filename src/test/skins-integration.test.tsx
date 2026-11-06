import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { skinAssetUrl, skinAspect, deviceForWidth, APP_THEME_IDS } from "@/lib/skins/registry";
import { SkinScreen } from "@/components/skin/SkinScreen";
import { applyTheme } from "@/lib/theme";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  window.localStorage.clear();
});
describe("six-theme shells", () => {
  it("uses the exact hall and 4K naming contracts", () => {
    const cdnBase = "https://cdn.example/skins/";
    expect(
      skinAssetUrl({
        skin: "gold",
        device: "desk",
        screen: "home",
        layer: "shell",
        hiRes: true,
        cdnBase,
      }),
    ).toBe("https://cdn.example/skins/gold/desk/gold-desk-home-shell-4k.png");
    expect(
      skinAssetUrl({
        skin: "gold",
        device: "desk",
        screen: "hall-open",
        layer: "shell",
        hiRes: true,
        cdnBase,
      }),
    ).toBe("https://cdn.example/skins/hall/desk/hall-desk-open-shell-4k.png");
    expect(
      skinAssetUrl({ skin: "cyber", device: "mob", screen: "home", layer: "full", cdnBase }),
    ).toBe("https://cdn.example/skins/cyber/mob/cyber-mob-home-full.png");
    expect(deviceForWidth(899)).toBe("mob");
    expect(deviceForWidth(900)).toBe("desk");
    expect(skinAspect("overchat", "desk")).toBe(1);
    expect(skinAspect("home", "mob")).toBe(9 / 16);
  });
  it("keeps the same live input node and draft across every theme", () => {
    vi.stubEnv("VITE_SKINS_CDN_BASE", "https://cdn.example/skins");
    render(
      <SkinScreen screen="signup">
        <label>
          Draft
          <input aria-label="Draft" />
        </label>
      </SkinScreen>,
    );
    const input = screen.getByLabelText("Draft");
    fireEvent.change(input, { target: { value: "unfinished" } });
    for (const theme of APP_THEME_IDS) {
      act(() => applyTheme(theme));
      expect(screen.getByLabelText("Draft")).toBe(input);
      expect(input).toHaveValue("unfinished");
      expect(document.documentElement.dataset["theme"]).toBe(theme);
    }
  });
});
