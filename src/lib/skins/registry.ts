export const SKIN_IDS = ["gold", "redneon", "blueneon", "cyber"] as const;
export type SkinId = (typeof SKIN_IDS)[number];

export const SCREEN_IDS = [
  "home", "signup", "upcoming", "merch", "signin", "wager", "live", "overchat",
  "results", "dashboard", "gateway1", "gateway2", "gateway3", "gateway4", "admin",
  "mediadeck", "leaderboard", "ledger-personal", "ledger-admin", "hall-collapsed", "hall-open",
] as const;
export type ScreenId = (typeof SCREEN_IDS)[number];
export type Device = "desk" | "mob";
export type Layer = "full" | "shell";

export const SIMPLE_THEME_IDS = ["simple-gold", "simple-alt"] as const;
export const APP_THEME_IDS = [
  ...SIMPLE_THEME_IDS,
  ...SKIN_IDS.map((skin) => `skin-${skin}` as const),
] as const;
export type AppThemeId = (typeof APP_THEME_IDS)[number];
export const DEFAULT_THEME: AppThemeId = "skin-gold";

export const SKIN_LABELS: Record<SkinId, string> = {
  gold: "Gold Filigree",
  redneon: "Red Neon",
  blueneon: "Blue Neon",
  cyber: "Cyber",
};

const HI_RES_SCREENS: Partial<Record<SkinId, ReadonlySet<ScreenId>>> = {
  gold: new Set(["home", "signin", "signup", "upcoming", "dashboard", "hall-collapsed", "hall-open"]),
  redneon: new Set(["home", "signin", "signup", "upcoming", "dashboard", "hall-collapsed", "hall-open"]),
};

export function skinFromTheme(theme: AppThemeId): SkinId | null {
  if (!theme.startsWith("skin-")) return null;
  const candidate = theme.slice("skin-".length);
  return (SKIN_IDS as readonly string[]).includes(candidate) ? (candidate as SkinId) : null;
}

export function skinAspect(screen: ScreenId, device: Device): number {
  if (device === "mob") return 9 / 16;
  return screen === "overchat" ? 1 : 16 / 9;
}

export function shouldUse4k(
  skin: SkinId,
  screen: ScreenId,
  device: Device,
  dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio,
): boolean {
  return device === "desk" && dpr >= 2 && Boolean(HI_RES_SCREENS[skin]?.has(screen));
}

function configuredCdnBase(): string {
  const base = import.meta.env?.VITE_SKINS_CDN_BASE as string | undefined;
  if (!base) throw new Error("VITE_SKINS_CDN_BASE is not configured");
  return base.replace(/\/$/, "");
}

export function skinAssetUrl(args: {
  skin: SkinId;
  device: Device;
  screen: ScreenId;
  layer: Layer;
  hiRes?: boolean;
  cdnBase?: string;
}): string {
  const { skin, device, screen, layer } = args;
  const base = (args.cdnBase ?? configuredCdnBase()).replace(/\/$/, "");
  const use4k = Boolean(args.hiRes && device === "desk" && layer === "shell" && HI_RES_SCREENS[skin]?.has(screen));
  // Hall assets retain the same skin/device directory and use dedicated hall screen identifiers.
  const filename = `${skin}-${device}-${screen}-${layer}${use4k ? "-4k" : ""}.png`;
  return `${base}/${skin}/${device}/${filename}`;
}
