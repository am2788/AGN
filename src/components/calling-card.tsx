import { cardLevelLabel, cardTag, isPrestigeMax } from "@/lib/calling-card";
import { DEFAULT_RANK_ARTWORK } from "@/lib/calling-card-artwork";
import { FONT_STYLES } from "@/lib/participant";
import { Shield, Swords, Star, Gem, Skull } from "lucide-react";
import { rankForPoints } from "@/lib/participant";

const RANK_BADGES = { recruit: Shield, contender: Swords, veteran: Star, elite: Gem, master: Skull };

export function CallingCard({
  name,
  points,
  fontKey = "body",
  stat,
  artworkUrl,
  previewClan,
  terminalPreview = false,
}: {
  name: string;
  points: number;
  fontKey?: keyof typeof FONT_STYLES;
  stat?: string;
  artworkUrl?: string;
  previewClan?: string | undefined;
  terminalPreview?: boolean;
}) {
  const prestige = isPrestigeMax(points);
  const rank = rankForPoints(points);
  const Badge = RANK_BADGES[rank.key];
  return (
    <div
      className={`calling-card ${prestige ? "calling-card-prestige" : ""} ${terminalPreview ? "calling-card-terminal" : ""}`}
      role="img"
      aria-label={`Calling card for ${name}, ${cardLevelLabel(points)}`}
    >
      <img className="calling-card-artwork" src={artworkUrl ?? DEFAULT_RANK_ARTWORK[rank.key]} alt="" loading="lazy" />
      <div className="calling-card-overlay">
        <div className="calling-card-identity font-mono">
          <span className={`calling-card-tag ${prestige ? "calling-card-gold" : ""}`}>{previewClan ? `[${previewClan}]` : cardTag(points)}</span>
          <span className={`calling-card-name ${FONT_STYLES[fontKey] ?? "font-body"} ${prestige ? "calling-card-gold" : ""}`}>{name}</span>
          {terminalPreview && <span className="calling-card-terminal-status">{rank.name.toUpperCase()} · ARTWORK PREVIEW</span>}
        </div>
        <div className="calling-card-progression font-mono">
          <div className="calling-card-metrics">
          <span className={`calling-card-level ${prestige ? "calling-card-gold" : ""}`}>{cardLevelLabel(points)}</span>
          {stat ? <span className="text-[10px] uppercase tracking-wide text-foreground/70">{stat}</span> : null}
          </div>
          <div className={`calling-card-badge calling-card-badge-${rank.key}`} title={`${rank.name} badge`}>
            <Badge aria-hidden="true" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </div>
  );
}
