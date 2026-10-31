import { useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import {
  ARENA_LANES,
  ARENA_TITLES,
  WAGER_STEPS,
  WAGER_TIERS,
  WAGERING_RULES,
  formatUsd,
  wagerSplit,
  type WagerTierId,
} from "@/lib/arena";

export function WagerSection() {
  const [lane, setLane] = useState<number>(1);
  const [tier, setTier] = useState<WagerTierId>("recruit");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [locked, setLocked] = useState(false);

  const selected = WAGER_TIERS.find((t) => t.id === tier) ?? WAGER_TIERS[0];
  const { prizeCents, vaultCents } = wagerSplit(selected.feeCents);
  const laneIndex = ARENA_LANES.indexOf(lane as (typeof ARENA_LANES)[number]);

  return (
    <section
      aria-label="Wagers"
      className="wager-matte w-full max-w-3xl rounded-md border border-wager-line p-6 sm:p-9"
    >
      <header className="mb-6 border-b border-wager-line/40 pb-5">
        <p className="text-[11px] font-medium tracking-[0.3em] text-crimson uppercase">
          18+ Wagerers only
        </p>
        <h2 className="mt-1 font-display text-xl font-semibold tracking-wider text-gold">
          Lock in your wager
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Three steps: pick an active matchup, choose your tier, confirm your 18+ ID status. No
          payment is taken in preview.
        </p>
      </header>

      {!locked && (
        <ol className="mb-7 grid gap-2 sm:grid-cols-3">
        {WAGER_STEPS.map((step) => (
          <li key={step.id} className="rounded-sm border border-wager-line/35 bg-vault-bg px-3 py-2">
            <span className="font-mono text-[10px] tracking-[0.2em] text-crimson">
              STEP {step.id}
            </span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-gold">
              {step.title}
            </span>
            <span className="mt-1 block text-[10px] leading-relaxed text-muted-foreground">
              {step.instruction}
            </span>
          </li>
        ))}
        </ol>
      )}

      {locked ? (
        <div className="py-5 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-gold" aria-hidden="true" />
          <p className="text-glow-gold mt-4 font-display text-lg font-bold tracking-widest text-gold">
            WAGER LOCKED — PREVIEW
          </p>
          <p className="mt-2 text-xs tracking-[0.2em] text-muted-foreground uppercase">
            {ARENA_TITLES[laneIndex]} · {selected.label} · {formatUsd(selected.feeCents)}
          </p>
          <p className="mt-4 text-[10px] uppercase text-muted-foreground">
            Preview only · no payment taken
          </p>
          <button
            type="button"
            onClick={() => setLocked(false)}
            className="glow-crimson mt-6 rounded-md border border-crimson px-6 py-2.5 font-display text-xs font-bold tracking-[0.25em] text-foreground uppercase"
          >
            Change wager
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (ageConfirmed) setLocked(true);
          }}
          className="space-y-6"
        >
          <fieldset>
            <legend className="mb-2 text-[10px] uppercase text-gold">
              Step 1 · Select active matchup
            </legend>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {ARENA_LANES.map((l, i) => (
                <label
                  key={l}
                  className={`cursor-pointer rounded-sm border px-2 py-2 text-center text-[10px] font-bold uppercase ${l === lane ? "border-crimson bg-crimson/20 text-foreground" : "border-wager-line/30 text-foreground/75 hover:border-wager-line/70"}`}
                >
                  <input
                    type="radio"
                    name="matchup"
                    value={l}
                    checked={l === lane}
                    onChange={() => setLane(l)}
                    className="sr-only"
                  />
                  {ARENA_TITLES[i]}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-[10px] uppercase text-gold">Step 2 · Choose tier</legend>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {WAGER_TIERS.map((t) => (
                <label
                  key={t.id}
                  className={`cursor-pointer rounded-sm border px-1.5 py-1.5 text-center text-[10px] uppercase ${t.id === tier ? "border-crimson bg-crimson/20 text-foreground" : "border-wager-line/30 text-foreground/75 hover:border-wager-line/70"}`}
                >
                  <input
                    type="radio"
                    name="tier"
                    value={t.id}
                    checked={t.id === tier}
                    onChange={() => setTier(t.id)}
                    className="sr-only"
                  />
                  <span className="block font-bold">{t.label}</span>
                  <span className="font-mono">{formatUsd(t.feeCents)}</span>
                </label>
              ))}
            </div>
            <dl className="mt-3 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <dt className="text-foreground/70">Daily prize</dt>
                <dd className="font-mono text-gold">{formatUsd(prizeCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground/70">To finals vault</dt>
                <dd className="font-mono text-crimson">{formatUsd(vaultCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-foreground/70">Referee</dt>
                <dd className="text-foreground">Result reviewed before payout</dd>
              </div>
            </dl>
          </fieldset>

          <div>
            <p className="mb-2 text-[10px] uppercase text-gold">
              Step 3 · Confirm 18+ ID verification status
            </p>
            <label htmlFor="wagerAge" className="flex cursor-pointer items-start gap-3">
              <input
                id="wagerAge"
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-wager-line"
              />
              <span className="text-xs leading-relaxed text-muted-foreground">
                I confirm I am 18 years of age or older and legally permitted to wager in my
                jurisdiction. Real ID verification is required before any paid wager.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!ageConfirmed}
            className="glow-crimson w-full rounded-md bg-crimson py-3.5 font-display text-sm font-bold tracking-[0.25em] text-foreground uppercase transition-transform enabled:hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-vault-panel disabled:text-muted-foreground"
          >
            Lock in wager
          </button>
          <p className="flex items-center justify-center gap-2 text-[10px] uppercase text-foreground/70">
            <LockKeyhole className="h-3 w-3" aria-hidden="true" /> Preview only · no payment taken
          </p>
        </form>
      )}

      <aside className="mt-7 rounded-sm border border-wager-line/40 bg-vault-bg p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
          Wagering rules
        </p>
        <ul className="mt-2 space-y-1.5">
          {WAGERING_RULES.map((rule) => (
            <li
              key={rule}
              className="flex gap-2 text-[11px] leading-relaxed text-muted-foreground"
            >
              <span aria-hidden="true" className="text-crimson">
                —
              </span>
              {rule}
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
