import { useMemo, useState } from "react";
import { Gem, List, Search, Shield, Skull, Star, Swords, Image } from "lucide-react";
import { CallingCard } from "./calling-card";
import { CALLING_CARD_ARTWORK } from "@/lib/calling-card-artwork";
import { cardLevelLabel } from "@/lib/calling-card";
import { rankForPoints } from "@/lib/participant";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { ForbiddenStashCard } from "./forbidden-stash-card";
import { StickmanFirefightCard } from "./stickman-firefight-card";
import { FirstStrikeCard } from "./first-strike-card";

// Example cards only — sample callsigns illustrating each rank tier, not real participants.
const SAMPLES = [
  { name: "RECRUIT_ONE", points: 120, rank: "Recruit · 0–499" },
  { name: "ANTONIO_MILLZ", points: 1200, rank: "Contender · 500–1,999" },
  { name: "VETERAN_V", points: 3400, rank: "Veteran · 2,000–4,999" },
  { name: "ELITE_NOVA", points: 7600, rank: "Elite · 5,000–9,999" },
  { name: "PERSEUS", points: 18450, rank: "Master · 10,000+" },
];

const BADGES = { recruit: Shield, contender: Swords, veteran: Star, elite: Gem, master: Skull };
const previewClan = (name: string) => name === "PERSEUS" ? "APEX" : name === "ANTONIO_MILLZ" ? "APN" : undefined;
// A presentation fixture only, independent of rank and real payment entitlements.
const ROWS = CALLING_CARD_ARTWORK.map((artwork, index) => ({ artwork, sample: SAMPLES[index % SAMPLES.length] }))
  .filter((row): row is typeof row & { sample: typeof SAMPLES[number] } => Boolean(row.sample))
  .sort((a, b) => b.sample.points - a.sample.points);
export function CallingCardShowcase() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("cards");
  const [selected, setSelected] = useState<typeof ROWS[number] | null>(null);
  const rows = useMemo(() => ROWS.map((row, index) => ({ ...row, position: index + 1 })).filter(({ sample, artwork }) =>
    `${sample.name} ${sample.rank} ${artwork.name}`.toLowerCase().includes(search.trim().toLowerCase())), [search]);
  return (
    <section className="py-8" aria-labelledby="card-showcase">
      <h2 id="card-showcase" className="font-display text-xl text-gold">Calling cards</h2>
      <p className="mt-1 text-xs text-muted-foreground">Artwork collection · Example participants</p>
      <div className="mt-5"><FirstStrikeCard /></div>
      <div className="mt-5"><ForbiddenStashCard username="PERSEUS" prestigeLevel={50} /></div>
      <div className="mt-5"><StickmanFirefightCard username="PERSEUS" prestigeLevel={50} /></div>
      <div className="my-5 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 size-4 text-neon-blue" aria-hidden="true" />
          <Input aria-label="Search calling cards" placeholder="Search gamertag / rank / artwork" value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 pl-10 font-mono text-xs focus-visible:ring-neon-blue" />
        </div>
        <div className="flex items-center gap-4">
          <p className="font-mono text-xs text-muted-foreground">EXAMPLE ROWS: <span className="text-neon-blue">{rows.length} / {ROWS.length}</span></p>
          <div className="flex gap-1" role="group" aria-label="Calling card view">
            <Button variant="ghost" size="icon" aria-label="Compact leaderboard" title="Compact leaderboard" aria-pressed={view === "matrix"} onClick={() => setView("matrix")} className={view === "matrix" ? "text-neon-blue bg-muted" : ""}><List /></Button>
            <Button variant="ghost" size="icon" aria-label="Vertical card stack" title="Vertical card stack" aria-pressed={view === "cards"} onClick={() => setView("cards")} className={view === "cards" ? "text-neon-blue bg-muted" : ""}><Image /></Button>
          </div>
        </div>
      </div>
      {view === "matrix" ? <div className="calling-matrix-scroll">
        <table className="calling-matrix font-mono">
          <caption className="sr-only">Sample engagement leaderboard; not live registrations</caption>
          <thead><tr><th scope="col">Rank</th><th scope="col">Competitor / identifier</th><th scope="col">Prestige</th><th scope="col">Level</th><th scope="col">Metric points</th></tr></thead>
          <tbody>{rows.map((row) => {
            const rank = rankForPoints(row.sample.points);
            const Badge = BADGES[rank.key];
            return <tr key={row.artwork.key} className={rank.key === "master" ? "calling-matrix-master" : ""}>
              <td>#{String(row.position).padStart(4, "0")}</td>
              <td><Button variant="link" onClick={() => setSelected(row)} aria-label={`Preview ${row.artwork.name} calling card`} className="h-auto max-w-full flex-col items-start gap-1 px-0 py-1 text-left whitespace-normal"><span className="text-neon-blue">[{rank.name.toUpperCase()}]</span><span className="text-foreground">{row.sample.name}</span><span className="text-xs font-normal text-muted-foreground">{row.artwork.name}</span></Button></td>
              <td><Badge className={`mx-auto size-6 calling-card-badge-${rank.key}`} aria-label={`${rank.name} badge`} /></td>
              <td>{cardLevelLabel(row.sample.points)}</td>
              <td>{row.sample.points.toLocaleString()} PTS</td>
            </tr>;
          })}</tbody>
        </table>
      </div> : <div className="calling-card-showcase-stack mt-5">
        {rows.map((row) => {
          const { artwork, sample, position } = row;
          return (
            <figure key={artwork.key} className="calling-card-showcase-row">
              <Button variant="ghost" className="calling-card-preview-trigger" onClick={() => setSelected(row)} aria-label={`Preview ${artwork.name} calling card`}>
                <CallingCard name={sample.name} points={sample.points} artworkUrl={artwork.url} stat={`${sample.points.toLocaleString()} pts`} previewClan={previewClan(sample.name)} terminalPreview />
              </Button>
              <figcaption className="font-mono text-xs text-muted-foreground"><span className={rankForPoints(sample.points).key === "master" ? "block text-gold" : "block text-neon-blue"}>#{String(position).padStart(4, "0")} // {rankForPoints(sample.points).name.toUpperCase()} TIER</span><span className="mt-2 block font-medium text-foreground">{artwork.name}</span><span className="mt-1 block">{sample.rank}</span></figcaption>
            </figure>
          );
        })}
      </div>}
      {!rows.length && <p role="status" className="py-8 text-sm text-muted-foreground">No matching calling cards.</p>}
      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="dark w-[calc(100%-2rem)] max-w-2xl border-neon-blue bg-card-midnight text-foreground">
          <DialogHeader><DialogTitle className="font-mono text-base text-neon-blue">{selected?.sample.name}</DialogTitle><DialogDescription>{selected?.artwork.name} · Example participant</DialogDescription></DialogHeader>
          {selected && <><CallingCard name={selected.sample.name} points={selected.sample.points} artworkUrl={selected.artwork.url} stat={`${selected.sample.points.toLocaleString()} pts`} previewClan={previewClan(selected.sample.name)} terminalPreview /><dl className="grid grid-cols-1 gap-4 font-mono text-xs"><div><dt className="text-muted-foreground">RANK</dt><dd className="mt-1">{selected.sample.rank}</dd></div></dl></>}
        </DialogContent>
      </Dialog>
    </section>
  );
}
