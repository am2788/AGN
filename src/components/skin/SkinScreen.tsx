import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import "./skin-screen.css";
import { useThemeStore } from "../../lib/skins/theme-store";
import { skinAspect, skinAssetUrl, skinFromTheme, shouldUse4k, type Device, type ScreenId } from "../../lib/skins/registry";

const MOBILE_QUERY = "(max-width: 899px)";
function useDevice(): Device {
  const [device, setDevice] = useState<Device>("desk");
  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const update = () => setDevice(query.matches ? "mob" : "desk");
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return device;
}

type SkinScreenProps = {
  screen: ScreenId;
  fallback?: ReactNode;
  children: ReactNode | ((device: Device) => ReactNode);
  className?: string;
  debug?: boolean;
};

/** Percentages are measured against the matching full reference artwork for each device. */
export function SkinSlot({
  box,
  children,
  className,
  style,
}: {
  box: readonly [x: number, y: number, width: number, height: number];
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const [x, y, width, height] = box;
  return <div className={className} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, width: `${width}%`, height: `${height}%`, ...style }}>{children}</div>;
}

export function SkinScreen({ screen, fallback = null, children, className, debug }: SkinScreenProps) {
  const theme = useThemeStore((state) => state.theme);
  const skin = skinFromTheme(theme);
  const device = useDevice();
  const isDebug = debug ?? (typeof window !== "undefined" && import.meta.env?.DEV && new URLSearchParams(window.location.search).has("skinDebug"));
  if (!skin) return <>{typeof children === "function" ? children(device) : fallback ?? children}</>;

  const aspect = skinAspect(screen, device);
  const stageStyle: CSSProperties = { aspectRatio: String(aspect), width: `min(100%, calc(100svh * ${aspect}))` };
  const hiRes = shouldUse4k(skin, screen, device);
  const shellUrl = skinAssetUrl({ skin, device, screen, layer: "shell", hiRes });
  const fullUrl = skinAssetUrl({ skin, device, screen, layer: "full" });

  return (
    <section className={`agn-skin-stage ${className ?? ""}`} style={stageStyle} data-skin={skin} data-device={device}>
      <img className="agn-skin-stage__shell" src={shellUrl} alt="" aria-hidden="true" decoding="async" fetchPriority="high" />
      {isDebug && <img className="agn-skin-stage__debug" src={fullUrl} alt="" aria-hidden="true" />}
      <div className="agn-skin-stage__content">{typeof children === "function" ? children(device) : children}</div>
    </section>
  );
}
