import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  THEME_KEYS,
  THEME_LABELS,
  isThemeKey,
  readStoredTheme,
  applyTheme,
  THEME_STORAGE_KEY,
} from "@/lib/theme";
import { profileSchema } from "@/lib/participant";

describe("appearance themes", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("offers exactly six supported themes", () => {
    expect(THEME_KEYS).toEqual([
      "simple-gold",
      "simple-neon",
      "skin-gold",
      "skin-redneon",
      "skin-blueneon",
      "skin-cyber",
    ]);
  });

  it("accepts only known theme keys in the profile schema", () => {
    const base = {
      display_name: "A",
      participant_type: "viewer" as const,
      leaderboard_visible: false,
      avatar_key: "crest" as const,
      accent_key: "crimson" as const,
      font_key: "body" as const,
    };
    expect(profileSchema.parse(base).theme_key).toBe("simple-gold");
    expect(profileSchema.parse({ ...base, theme_key: "simple-gold" }).theme_key).toBe(
      "simple-gold",
    );
    expect(() => profileSchema.parse({ ...base, theme_key: "rainbow" })).toThrow();
  });

  it("rejects unknown stored theme values", () => {
    expect(isThemeKey("simple-gold")).toBe(true);
    expect(isThemeKey("simple-neon")).toBe(true);
    expect(isThemeKey("dark-mode")).toBe(false);
    expect(isThemeKey(42)).toBe(false);
  });

  it("applies each theme as a root attribute", () => {
    applyTheme("simple-neon");
    expect(document.documentElement.getAttribute("data-theme")).toBe("simple-neon");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("simple-neon");
    applyTheme("simple-gold");
    expect(document.documentElement.getAttribute("data-theme")).toBe("simple-gold");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("simple-gold");
  });

  it("preserves the route, mounted form and half-typed input across every available theme", () => {
    const originalUrl = window.location.href;
    window.history.replaceState({ draft: true }, "", "/account?tab=settings#theme");
    const form = document.createElement("form");
    const input = document.createElement("input");
    input.value = "half-typed player na";
    form.append(input);
    document.body.append(form);
    const push = vi.spyOn(window.history, "pushState");
    const replace = vi.spyOn(window.history, "replaceState");
    try {
      for (const theme of THEME_KEYS) {
        applyTheme(theme);
        expect(document.body.contains(form)).toBe(true);
        expect(form.firstChild).toBe(input);
        expect(input.value).toBe("half-typed player na");
        expect(window.location.pathname + window.location.search + window.location.hash).toBe(
          "/account?tab=settings#theme",
        );
        expect(window.history.state).toEqual({ draft: true });
      }
      expect(push).not.toHaveBeenCalled();
      expect(replace).not.toHaveBeenCalled();
    } finally {
      push.mockRestore();
      replace.mockRestore();
      form.remove();
      window.history.replaceState(null, "", originalUrl);
    }
  });

  it("reads back the stored theme and falls back to Simple Gold", () => {
    expect(readStoredTheme()).toBe("simple-gold");
    window.localStorage.setItem(THEME_STORAGE_KEY, "simple-gold");
    expect(readStoredTheme()).toBe("simple-gold");
    window.localStorage.setItem(THEME_STORAGE_KEY, "bogus");
    expect(readStoredTheme()).toBe("simple-gold");
  });
});
