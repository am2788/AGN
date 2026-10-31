import { useEffect, useRef, useState } from "react";
import stashVideo from "@/assets/calling-cards/forbidden_stash.mp4.asset.json";
import stashPoster from "@/assets/calling-cards/forbidden_stash_poster.jpg.asset.json";

// Hover sounds play only when real audio files are supplied; none are bundled yet.
export function ForbiddenStashCard({ username, prestigeLevel, shutterSrc, humSrc }: {
  username: string;
  prestigeLevel: number;
  shutterSrc?: string;
  humSrc?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const shutter = useRef<HTMLAudioElement | null>(null);
  const hum = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    shutter.current = shutterSrc ? new Audio(shutterSrc) : null;
    hum.current = humSrc ? new Audio(humSrc) : null;
    if (shutter.current) shutter.current.volume = 0.7;
    if (hum.current) { hum.current.loop = true; hum.current.volume = 0.4; }
    return () => { shutter.current?.pause(); hum.current?.pause(); };
  }, [shutterSrc, humSrc]);

  useEffect(() => {
    if (hovered) {
      if (shutter.current) { shutter.current.currentTime = 0; void shutter.current.play().catch(() => {}); }
      void hum.current?.play().catch(() => {});
    } else {
      shutter.current?.pause();
      hum.current?.pause();
    }
  }, [hovered]);

  return (
    <div className="forbidden-stash-card" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      role="img" aria-label={`Forbidden Stash calling card for ${username}, level ${prestigeLevel}`}>
      <img src={stashPoster.url} alt="" className="stash-fallback" />
      <video className="stash-animation" src={stashVideo.url} poster={stashPoster.url} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
      <div className="stash-profile-overlay">
        <div>
          <span className="calling-card-tag">AGN PREMIUM CARD</span>
          <p className="calling-card-name mt-1 uppercase">{username}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-muted-foreground">PRESTIGE STATUS</span>
          <span className="text-lg font-bold text-gold">LVL {prestigeLevel}</span>
        </div>
      </div>
    </div>
  );
}
