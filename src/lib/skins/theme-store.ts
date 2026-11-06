import { create } from "zustand";
import { persist } from "zustand/middleware";
import { APP_THEME_IDS, DEFAULT_THEME, type AppThemeId } from "./registry";

const STORAGE_KEY = "agn-theme";
type ThemeState = {
  theme: AppThemeId;
  signedIn: boolean;
  setTheme: (theme: AppThemeId) => Promise<void>;
  setSignedIn: (signedIn: boolean) => void;
  hydrateFromServer: (theme: AppThemeId) => void;
};
type ThemePersistence = (theme: AppThemeId) => Promise<void>;
let persistThemeOnServer: ThemePersistence | undefined;
const isTheme = (value: unknown): value is AppThemeId => typeof value === "string" && (APP_THEME_IDS as readonly string[]).includes(value);
function applyTheme(theme: AppThemeId) {
  if (typeof document !== "undefined") document.documentElement.dataset.theme = theme;
}
export function configureThemePersistence(persistTheme: ThemePersistence | undefined) {
  persistThemeOnServer = persistTheme;
}

export const useThemeStore = create<ThemeState>()(persist(
  (set, get) => ({
    theme: DEFAULT_THEME,
    signedIn: false,
    setSignedIn: (signedIn) => set({ signedIn }),
    hydrateFromServer: (theme) => {
      if (!isTheme(theme)) return;
      applyTheme(theme);
      set({ theme, signedIn: true });
    },
    setTheme: async (theme) => {
      if (!isTheme(theme)) throw new Error("Unsupported AGN theme");
      const previous = get().theme;
      applyTheme(theme);
      set({ theme });
      if (get().signedIn) {
        try {
          if (!persistThemeOnServer) throw new Error("Theme server persistence is not configured");
          await persistThemeOnServer(theme);
        } catch (error) {
          // Roll back the optimistic change if server persistence fails.
          applyTheme(previous);
          set({ theme: previous });
          throw error;
        }
      }
    },
  }),
  {
    name: STORAGE_KEY,
    partialize: (state) => ({ theme: state.theme, signedIn: false }) as ThemeState,
    onRehydrateStorage: () => (state) => {
      const theme = state && isTheme(state.theme) ? state.theme : DEFAULT_THEME;
      if (state) state.theme = theme;
      applyTheme(theme);
    },
  },
));
export const getTheme = () => useThemeStore.getState().theme;
