import { Shield, Swords } from "lucide-react";
import { AgnCrest } from "./agn-brand";
export function ParticipantAvatar({ avatar, url, points = 0 }: { avatar: string; url?: string | null; points?: number }) {
  return <div className={`flex size-14 shrink-0 items-center justify-center rounded-sm border border-wager-line/50 bg-vault-panel text-gold ${points >= 10000 ? "rank-halo" : points >= 5000 ? "rank-ring" : ""}`}>{url ? <img src={url} alt="Custom participant avatar" className="size-full rounded-sm object-cover" /> : avatar === "shield" ? <Shield className="size-8" /> : avatar === "swords" ? <Swords className="size-8" /> : <AgnCrest />}</div>;
}