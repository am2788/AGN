import { APP_THEME_IDS, DEFAULT_THEME, type AppThemeId } from "./registry";

const STORAGE_KEY = "agn-theme";
type ThemeListener = (theme: AppThemeId) => void;
type ThemePersistence = (theme: AppThemeId) => Promise<void>;

let activeTheme: AppThemeId = DEFAULT_THEME;
let persistToServer: ThemePersistence | undefined;
const listeners = new Set<ThemeListener>();

function isTheme(value: unknown): value is AppThemeId {
  return typeof value === "string" && (APP_THEME_IDS as readonly string[]).includes(value);
}

function applyTheme(theme: AppThemeId): void {
  if (typeof document !== "undefined") document.documentElement.dataset.theme = theme;
  for (const listener of listeners) listener(theme);
}

export function getTheme(): AppThemeId {
  return activeTheme;
}

export function subscribeTheme(listener: ThemeListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Configure this with the app's authenticated PATCH /me/theme server function. */
export function configureThemePersistence(persist: ThemePersistence | undefined): void {
  persistToServer = persist;
}

/** Hydrate once at application startup; theme changes do not touch router state. */
export function hydrateTheme(signedIn = false): AppThemeId {
  let theme = DEFAULT_THEME;
  if (typeof window !== "undefined" && !signedIn) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isTheme(stored)) theme = stored;
    } catch {
      // Storage can be unavailable in private browsing; keep the default theme.
    }
  }
  activeTheme = theme;
  applyTheme(theme);
  return theme;
}

/** Apply immediately so an active form remains mounted, then persist in the background. */
export function setTheme(theme: AppThemeId): Promise<void> {
  if (!isTheme(theme)) return Promise.reject(new Error("Unsupported AGN theme"));
  activeTheme = theme;
  applyTheme(theme);

  if (persistToServer) return persistToServer(theme);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Theme remains active for this page even if local persistence is blocked.
    }
  }
  return Promise.resolve();
}
