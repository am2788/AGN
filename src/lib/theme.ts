import { APP_THEME_IDS, type AppThemeId } from "./skins/registry";
export const THEME_KEYS = APP_THEME_IDS;
export type ThemeKey = AppThemeId;
export const THEME_LABELS: Record<ThemeKey, string> = {
  "simple-gold": "Simple Gold (default)",
  "simple-neon": "Simple Neon",
  "skin-gold": "Gold Filigree",
  "skin-redneon": "Red Neon",
  "skin-blueneon": "Blue Neon",
  "skin-cyber": "Cyber",
};
export const THEME_STORAGE_KEY = "agn-theme";
export function isThemeKey(value: unknown): value is ThemeKey {
  return typeof value === "string" && (THEME_KEYS as readonly string[]).includes(value);
}
export function readStoredTheme(): ThemeKey {
  if (typeof window === "undefined") return "simple-gold";
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeKey(value) ? value : "simple-gold";
  } catch {
    return "simple-gold";
  }
}
export function applyTheme(theme: ThemeKey) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset["theme"] = theme;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* Optional storage. */
  }
  window.dispatchEvent(new CustomEvent<ThemeKey>("agn-theme-change", { detail: theme }));
}
