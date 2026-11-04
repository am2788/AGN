// Site appearance themes. "detailed" is the default AGN presentation;
// "simple-gold" and "simple-neon" are the two Simple options from the
// two-theme brief. Themes are pure presentation: they only swap design
// tokens on shared components and never touch routes, sessions, forms,
// media or business logic.
export const THEME_KEYS = ["detailed", "simple-gold", "simple-neon"] as const;
export type ThemeKey = (typeof THEME_KEYS)[number];

export const THEME_LABELS: Record<ThemeKey, string> = {
  detailed: "Detailed",
  "simple-gold": "Simple Gold (default)",
  "simple-neon": "Simple Neon",
};

export const THEME_STORAGE_KEY = "agn-theme";

export function isThemeKey(value: unknown): value is ThemeKey {
  return typeof value === "string" && (THEME_KEYS as readonly string[]).includes(value);
}

export function readStoredTheme(): ThemeKey {
  if (typeof window === "undefined") return "detailed";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeKey(stored) ? stored : "detailed";
  } catch {
    return "detailed";
  }
}

// Applies the theme to the document root and remembers it locally.
// Switching themes never reloads the page, so the current route,
// session, form input and playing media are all preserved.
export function applyTheme(theme: ThemeKey) {
  if (typeof document === "undefined") return;
  if (theme === "detailed") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private browsing may block storage; the theme still applies for this session.
  }
  window.dispatchEvent(new CustomEvent<ThemeKey>("agn-theme-change", { detail: theme }));
}
