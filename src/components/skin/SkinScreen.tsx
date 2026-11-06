import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { readStoredTheme, isThemeKey } from "@/lib/theme";
import {
  skinFromTheme,
  skinAspect,
  skinAssetUrl,
  shouldUse4k,
  type ScreenId,
} from "@/lib/skins/registry";

export type Hotspot = { left: number; top: number; width: number; height: number };
export function SkinHotspot({ box, children }: { box: Hotspot; children: ReactNode }) {
  const style: CSSProperties = {
    left: `${box.left}%`,
    top: `${box.top}%`,
    width: `${box.width}%`,
    height: `${box.height}%`,
  };
  return (
    <div className="skin-hotspot" style={style}>
      {children}
    </div>
  );
}

/** Stable wrapper: artwork may change, but children never receive theme-dependent keys. */
export function SkinScreen({ screen, children }: { screen: ScreenId; children: ReactNode }) {
  const mobile = useIsMobile();
  const [theme, setTheme] = useState<ReturnType<typeof readStoredTheme>>("simple-gold");
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  useEffect(() => {
    setTheme(readStoredTheme());
    const change = (event: Event) => {
      const value: unknown = (event as CustomEvent).detail;
      if (isThemeKey(value)) setTheme(value);
    };
    window.addEventListener("agn-theme-change", change);
    return () => window.removeEventListener("agn-theme-change", change);
  }, []);
  const skin = skinFromTheme(theme);
  const device = mobile ? "mob" : "desk";
  const base = import.meta.env["VITE_SKINS_CDN_BASE"] as string | undefined;
  const url =
    skin && base
      ? skinAssetUrl({
          skin,
          device,
          screen,
          layer: "shell",
          hiRes: shouldUse4k(skin, screen, device),
          cdnBase: base,
        })
      : null;
  return (
    <div
      className={skin ? "skin-stage" : undefined}
      data-screen={screen}
      data-device={device}
      style={skin ? { aspectRatio: String(skinAspect(screen, device)) } : undefined}
    >
      {url && failedUrl !== url && (
        <img
          className="skin-stage-art"
          src={url}
          alt=""
          aria-hidden="true"
          draggable={false}
          onError={() => setFailedUrl(url)}
        />
      )}
      <div className="skin-stage-content">{children}</div>
    </div>
  );
}
