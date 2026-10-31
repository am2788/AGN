import firefightVideo from "@/assets/calling-cards/stickman_firefight.mp4.asset.json";
import firefightPoster from "@/assets/calling-cards/stickman_firefight_poster.jpg.asset.json";

// Featured animated calling card: static poster first, looping MP4 on top, neon-blue UI overlay.
export function StickmanFirefightCard({ username, prestigeLevel }: {
  username: string;
  prestigeLevel: number;
}) {
  return (
    <div className="stickman-firefight-card"
      role="img" aria-label={`Stickman Firefight calling card for ${username}, level ${prestigeLevel}`}>
      <img src={firefightPoster.url} alt="" className="firefight-fallback" />
      <video className="firefight-video-loop" src={firefightVideo.url} poster={firefightPoster.url} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
      <div className="firefight-ui-overlay">
        <div>
          <span className="calling-card-tag">AGN ACTION CARD</span>
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
