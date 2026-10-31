import video from "@/assets/calling-cards/first_strike.mp4.asset.json";
import poster from "@/assets/calling-cards/first_strike_poster.jpg.asset.json";

// 1-of-1 card reserved for the first player or team to buy a bracket slot.
// Unclaimed until a verified first purchase exists.
export function FirstStrikeCard() {
  return (
    <div className="stickman-firefight-card first-strike-card" role="img" aria-label="First Strike 1-of-1 calling card, unclaimed">
      <img src={poster.url} alt="" className="firefight-fallback" />
      <video className="firefight-video-loop" src={video.url} poster={poster.url} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
      <div className="firefight-ui-overlay">
        <div>
          <span className="calling-card-tag">FIRST STRIKE · 1 OF 1</span>
          <p className="calling-card-name mt-1 uppercase">UNCLAIMED</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-muted-foreground">RESERVED FOR</span>
          <span className="text-sm font-bold text-gold">FIRST BRACKET SLOT</span>
        </div>
      </div>
    </div>
  );
}
