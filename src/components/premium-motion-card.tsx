import { useEffect, useRef } from "react";
import { CALLING_CARD_MOTION, type MotionCard } from "@/lib/calling-card-motion";
import { cardLevelLabel } from "@/lib/calling-card";

// Shared presentation for the premium motion lineup: static poster underneath,
// looping muted clip on top, neon-blue identity overlay. Reduced-motion visitors
// get the poster only (hidden in styles.css and never started here).
export function PremiumMotionCard({ card, username, points }: {
  card: MotionCard;
  username: string;
  points: number;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Only the cards actually on screen play. Browsers hold back autoplay once
  // several videos compete for the same media budget, and a scroll that briefly
  // crosses the threshold can abort a start request, so each clip is started
  // deliberately when it enters the viewport, retried if the start is aborted,
  // and stopped again when it leaves.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let want = false;
    let timer: number | undefined;
    const attempt = () => {
      if (!want) return;
      el.play().catch(() => {
        if (want) timer = window.setTimeout(attempt, 250);
      });
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        want = entry.isIntersecting;
        if (want) {
          if (timer !== undefined) window.clearTimeout(timer);
          attempt();
        } else {
          el.pause();
        }
      }
    }, { rootMargin: "120px" });
    observer.observe(el);
    return () => {
      want = false;
      if (timer !== undefined) window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="premium-motion-card" role="img"
      aria-label={`${card.name} premium motion calling card for ${username}, level ${cardLevelLabel(points)}`}>
      <img src={card.posterUrl} alt="" className="premium-motion-poster" loading="lazy" />
      <video ref={videoRef} className="premium-motion-video" src={card.videoUrl} poster={card.posterUrl}
        muted loop playsInline preload="metadata" aria-hidden="true" />
      <div className="premium-motion-overlay">
        <div className="premium-motion-identity">
          <span className="calling-card-tag">PREMIUM MOTION · EXAMPLE</span>
          <p className="calling-card-name mt-1 uppercase">{username}</p>
        </div>
        <div className="premium-motion-meter">
          <span className="premium-motion-status text-xs">PRESTIGE STATUS</span>
          <span className="premium-motion-level text-lg font-bold">{cardLevelLabel(points)}</span>
        </div>
      </div>
    </div>
  );
}

// The lineup as one section. Sample callsigns only — these rows are presentation
// fixtures, not real participants, and premium motion cards stay un-equippable.
export function PremiumMotionLineup({ username, points }: { username: string; points: number }) {
  return (
    <section aria-labelledby="premium-motion-lineup">
      <h3 id="premium-motion-lineup" className="font-display text-base text-gold">Premium motion lineup</h3>
      <p className="mt-1 text-xs text-muted-foreground">Animated artwork · Example participant · Not equippable</p>
      <div className="premium-motion-grid mt-4">
        {CALLING_CARD_MOTION.map((card) => (
          <figure key={card.key} className="premium-motion-cell">
            <PremiumMotionCard card={card} username={username} points={points} />
            <figcaption className="font-mono text-xs text-muted-foreground">
              <span className="block font-medium text-foreground">{card.name}</span>
              <span className="mt-1 block">PREMIUM MOTION</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
