import { useEffect, useRef, useState } from "react";
import stageVideo from "@/assets/theatre/theatre_stage.mp4.asset.json";
import stagePoster from "@/assets/theatre/theatre_stage_poster.jpg.asset.json";

type TheatreState = "CLOSED" | "OPENING" | "ACTIVE";
/** Matches the video's move from bracket board to spotlit stage. */
const STAGE_REVEAL_MS = 4000;

/** Unified broadcast theatre: side shutters reveal the stage video. "Open" never implies a verified live match. */
export function ArenaTheatre() {
  const [state, setState] = useState<TheatreState>("CLOSED");
  const timer = useRef<number | undefined>(undefined);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const open = () => {
    if (state !== "CLOSED") return;
    setState("OPENING");
    const v = video.current;
    if (v && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.currentTime = 0;
      void v.play().catch(() => {});
    }
    timer.current = window.setTimeout(() => setState("ACTIVE"), STAGE_REVEAL_MS);
  };

  const reset = () => {
    window.clearTimeout(timer.current);
    setState("CLOSED");
    const v = video.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  const shut = state === "CLOSED";
  const ease = "transition-transform duration-1000 ease-[cubic-bezier(0.77,0,0.175,1)] motion-reduce:transition-none";

  return (
    <section aria-label="AGN Broadcast Theatre" className="w-full max-w-5xl">
      <div className="relative flex aspect-video w-full flex-col overflow-hidden rounded-sm border-2 border-wager-line/60 bg-vault-bg font-mono text-foreground shadow-2xl">
        <header className="z-30 flex h-10 w-full shrink-0 select-none items-center justify-between gap-2 border-b border-border bg-background/90 px-3 sm:h-12 sm:px-6">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs" aria-live="polite">
            <span className={`h-2 w-2 rounded-full ${state === "ACTIVE" ? "bg-wager-line" : "animate-pulse bg-crimson"}`} aria-hidden="true" />
            <span className="font-bold tracking-widest text-muted-foreground">
              {state === "ACTIVE" ? "ARENA STAGE OPEN" : `TERMINAL STANDBY // ${state}`}
            </span>
          </div>
          <span className="hidden text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 sm:block">Aether Stream Transmission</span>
        </header>

        <div className="relative z-10 flex w-full flex-1 items-center justify-center overflow-hidden bg-background">
          <video ref={video} src={stageVideo.url} poster={stagePoster.url} muted playsInline preload="auto" aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-80" />

          <div className="pointer-events-none absolute bottom-3 left-4 z-30 select-none border-l border-border bg-vault-bg/70 py-0.5 pl-3 pr-2 sm:left-6">
            <p className="text-[10px] text-muted-foreground">Example scoreboard · stream connects at air time</p>
          </div>

          <div className={`absolute inset-y-0 left-0 z-20 flex w-1/2 flex-col justify-between border-r border-border bg-card p-4 py-8 ${ease} ${shut ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="text-[9px] font-bold tracking-widest text-wager-line/50">[ SHUTTER_SECURE_L ]</div>
            <div className="h-12 w-1.5 border-l border-wager-line/30 bg-wager-line/10" />
          </div>
          <div className={`absolute inset-y-0 right-0 z-20 flex w-1/2 flex-col justify-between border-l border-border bg-card p-4 py-8 text-right ${ease} ${shut ? "translate-x-0" : "translate-x-full"}`}>
            <div className="ml-auto h-12 w-1.5 border-r border-wager-line/30 bg-wager-line/10" />
            <div className="text-[9px] font-bold tracking-widest text-wager-line/50">[ SHUTTER_SECURE_R ]</div>
          </div>
        </div>

        <footer className="z-40 flex h-12 w-full shrink-0 items-center justify-between gap-2 border-t border-border bg-background px-3 sm:h-14 sm:px-6">
          <span className="hidden text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70 sm:block">AGN Broadcast Theatre</span>
          <div className="ml-auto flex gap-2">
            {!shut && (
              <button type="button" onClick={reset}
                className="rounded-sm border border-border px-3 py-1 text-[11px] font-bold text-muted-foreground hover:bg-card focus-visible:outline-2 focus-visible:outline-crimson">
                Reset Shutters
              </button>
            )}
            <button type="button" disabled={!shut} onClick={open}
              className="rounded-sm border border-wager-line/40 px-4 py-1 text-[11px] font-bold text-wager-line hover:bg-wager-line hover:text-background focus-visible:outline-2 focus-visible:outline-crimson disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-wager-line">
              {shut ? "EXECUTE OPENING" : "THEATRE ACTIVE"}
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}
