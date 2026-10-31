import { useEffect, useRef, useState } from "react";
import { Activity, AlertTriangle, Check, Minus, Pause, Play, Plus, RotateCcw, Save, Shield, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ACTIVE_LOOP_END_SECONDS, BROADCAST_BASELINE, BUFFER_SECONDS, CROWDFUND_BASELINE_CAPTION, INITIAL_MATCH, THEATRE_GAMES, bufferAt, crowdfundBaselineAmount, hoverAudioState, parseScore, videoCue, type BroadcastPhase, type TheatreGame } from "@/lib/theatre";
import terminal from "@/assets/theatre/red_alert_terminal.mp4.asset.json";
import poster from "@/assets/theatre/red_alert_terminal_poster.jpg.asset.json";
import disputePoster from "@/assets/theatre/red_alert_terminal_dispute.jpg.asset.json";

export default function AgnRefinedViewport() {
  const [activeGame, setActiveGame] = useState<TheatreGame>("MW4");
  const currentProfile = THEATRE_GAMES[activeGame];
  const [phase, setPhase] = useState<BroadcastPhase>("ACTIVE_LANE");
  const [match, setMatch] = useState(INITIAL_MATCH);
  const [buffer, setBuffer] = useState(BUFFER_SECONDS);
  const [running, setRunning] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const [draft, setDraft] = useState({ home: "5", away: "3", note: "" });
  const [error, setError] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const [audioSector, setAudioSector] = useState(hoverAudioState(false));
  const video = useRef<HTMLVideoElement>(null);
  const elapsed = useRef(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!running) return;
    const origin = performance.now() - elapsed.current * 1000;
    const timer = window.setInterval(() => {
      elapsed.current = (performance.now() - origin) / 1000;
      setBuffer(bufferAt(elapsed.current));
    }, 200);
    return () => window.clearInterval(timer);
  }, [running, resetKey]);

  useEffect(() => {
    const element = video.current;
    if (!element || reducedMotion || videoUnavailable) return;
    const sync = () => {
      if (element.readyState < 1) return;
      const cue = videoCue(phase, element.currentTime);
      element.currentTime = cue.seek ?? 0;
      if (cue.pause || !running) element.pause();
      else void element.play().catch(() => setVideoUnavailable(true));
    };
    const clamp = () => {
      if (phase === "ACTIVE_LANE" && element.currentTime >= ACTIVE_LOOP_END_SECONDS) element.currentTime = 0;
    };
    sync();
    element.addEventListener("loadedmetadata", sync);
    element.addEventListener("timeupdate", clamp);
    return () => { element.removeEventListener("loadedmetadata", sync); element.removeEventListener("timeupdate", clamp); element.pause(); };
  }, [phase, reducedMotion, running, videoUnavailable, resetKey]);

  const log = (text: string) => setHistory(previous => [text, ...previous].slice(0, 6));
  const handleTabHover = (isEntering: boolean) => {
    setAudioSector(hoverAudioState(isEntering));
    console.info(`[AGN AUDIO MATRIX] ${isEntering ? "+3dB tick boost callback" : "Standard audio baseline restored"} · preview hook only; no audio source connected.`);
  };
  const disputed = phase === "DISPUTE";
  const toggleDispute = () => {
    setPhase(disputed ? "ACTIVE_LANE" : "DISPUTE");
    log(disputed ? "Dispute cleared · normal playback restored" : "Dispute opened · video held at 09.0s");
  };
  const changeScore = (lane: "homeScore" | "awayScore", amount: number) => {
    setMatch(previous => ({ ...previous, [lane]: Math.max(0, previous[lane] + amount) }));
    log(`${lane === "homeScore" ? "Alpha" : "Beta"} sample score ${amount > 0 ? "+1" : "−1"}`);
  };
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const home = parseScore(draft.home), away = parseScore(draft.away);
    if (home === null || away === null) { setError("Scores must be nonnegative whole numbers."); return; }
    if (!draft.note.trim()) { setError("Add a reason for this sample correction."); return; }
    setMatch(previous => ({ ...previous, homeScore: home, awayScore: away }));
    setError(""); log(`Sample correction ${home}–${away} · ${draft.note.trim()}`);
  };
  const reset = () => {
    setPhase("ACTIVE_LANE"); setMatch(INITIAL_MATCH); setBuffer(BUFFER_SECONDS);
    elapsed.current = 0; setResetKey(key => key + 1); setRunning(true);
    setDraft({ home: "5", away: "3", note: "" }); setError(""); setHistory([]); setVideoUnavailable(false);
  };
  const selectGame = (game: TheatreGame) => {
    if (game === activeGame) return;
    reset(); setActiveGame(game);
  };

  return (
    <section aria-label="Aether Gateway broadcast control preview" className="theatre-terminal w-full font-mono text-foreground" data-phase={phase} data-audio-boost-db={audioSector.boostDb}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-y border-border py-4">
        <div className="flex items-center gap-3"><Activity className="size-5 text-neon-blue" /><h2 className="text-xs font-bold">AETHER GATEWAY // BROADCAST CONTROL</h2></div>
        <span className="border border-neon-blue/40 px-2 py-1 text-[10px] text-neon-blue">INTERACTIVE PREVIEW · NO LIVE FEED</span>
      </header>
      <Tabs value={activeGame} onValueChange={value => { if (value in THEATRE_GAMES) selectGame(value as TheatreGame); }} className="mt-4">
        <TabsList aria-label="Tournament game" className="grid h-auto w-full grid-cols-2 gap-1 rounded-sm bg-card-midnight p-1 sm:grid-cols-4">
          {(Object.keys(THEATRE_GAMES) as TheatreGame[]).map(game => <TabsTrigger key={game} value={game} className="min-w-0 rounded-sm px-2 py-2 text-[11px] data-[state=active]:bg-neon-blue/10 data-[state=active]:text-neon-blue">{game}</TabsTrigger>)}
        </TabsList>
      </Tabs>
      <div className="mt-5 grid min-w-0 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-6 lg:order-none order-2">
          <div className="flex items-center gap-3 border-b border-border pb-5"><Shield className="size-9 text-gold" /><div><h3 className="text-sm font-bold">BROADCAST SANDBOX</h3><p className="mt-1 text-[10px] text-muted-foreground">Sample match · session-only changes</p></div></div>
          <Tabs defaultValue="telemetry">
            <TabsList onMouseEnter={() => handleTabHover(true)} onMouseLeave={() => handleTabHover(false)} className="h-auto w-full rounded-sm bg-card-midnight p-1">
              <TabsTrigger value="telemetry" className="flex-1 gap-2 px-2 text-[11px] data-[state=active]:bg-neon-blue/10 data-[state=active]:text-neon-blue"><Activity className="size-3" />Telemetry</TabsTrigger>
              <TabsTrigger value="overrides" className="flex-1 gap-2 px-2 text-[11px] data-[state=active]:bg-neon-blue/10 data-[state=active]:text-neon-blue"><SlidersHorizontal className="size-3" />Corrections</TabsTrigger>
            </TabsList>
            <TabsContent value="telemetry" onMouseEnter={() => handleTabHover(true)} onMouseLeave={() => handleTabHover(false)} className="space-y-4 pt-3">
              <Button variant="outline" onClick={toggleDispute} className="w-full justify-start whitespace-normal rounded-sm border-crimson/40 text-crimson">{disputed ? <Check /> : <AlertTriangle />}{disputed ? "Clear sample dispute" : "Trigger sample dispute"}</Button>
              {(["homeScore", "awayScore"] as const).map((lane, index) => <div key={lane} className="flex items-center justify-between border-b border-border pb-3"><span className="text-xs text-muted-foreground">{index === 0 ? "Alpha" : "Beta"} score</span><div className="flex items-center gap-2"><Button variant="ghost" size="icon" aria-label={`Decrease ${index === 0 ? "Alpha" : "Beta"} score`} disabled={match[lane] === 0} onClick={() => changeScore(lane, -1)}><Minus /></Button><output className="w-7 text-center text-neon-blue">{match[lane]}</output><Button variant="ghost" size="icon" aria-label={`Increase ${index === 0 ? "Alpha" : "Beta"} score`} onClick={() => changeScore(lane, 1)}><Plus /></Button></div></div>)}
              <div className="flex gap-2"><Button variant="outline" className="flex-1 rounded-sm text-xs" onClick={() => setRunning(value => !value)}>{running ? <Pause /> : <Play />}{running ? "Pause preview" : "Resume preview"}</Button><Button variant="outline" size="icon" aria-label="Reset preview" title="Reset preview" onClick={reset}><RotateCcw /></Button></div>
            </TabsContent>
            <TabsContent value="overrides" onMouseEnter={() => handleTabHover(true)} onMouseLeave={() => handleTabHover(false)} className="pt-3">
              <form onSubmit={save} className="space-y-4">
                <div className="grid grid-cols-2 gap-3"><label className="space-y-2 text-xs text-muted-foreground">Alpha score<Input aria-label="Alpha corrected score" inputMode="numeric" value={draft.home} onChange={event => setDraft({ ...draft, home: event.target.value })} /></label><label className="space-y-2 text-xs text-muted-foreground">Beta score<Input aria-label="Beta corrected score" inputMode="numeric" value={draft.away} onChange={event => setDraft({ ...draft, away: event.target.value })} /></label></div>
                <label className="block space-y-2 text-xs text-muted-foreground">Correction reason<Input maxLength={160} value={draft.note} onChange={event => setDraft({ ...draft, note: event.target.value })} placeholder="Match review note" /></label>
                {error && <p role="alert" className="text-xs text-crimson">{error}</p>}
                <Button type="submit" variant="outline" className="w-full rounded-sm text-xs text-neon-blue"><Save />Apply sample correction</Button>
                <p className="text-[10px] leading-relaxed text-muted-foreground">Preview only. Official scores, registrations and payments remain unchanged.</p>
              </form>
            </TabsContent>
          </Tabs>
          <div className="border-t border-border pt-4"><h3 className="mb-3 text-[10px] text-muted-foreground">SESSION ACTIVITY</h3><ul aria-live="polite" className="space-y-3 text-[10px] leading-relaxed">{history.length ? history.map((entry, index) => <li key={`${index}-${entry}`} className="break-words border-l border-neon-blue/40 pl-3">{entry}</li>) : <li className="text-muted-foreground">No sample changes recorded.</li>}</ul></div>
        </aside>
        <div className="min-w-0 space-y-3">
          <div className="theatre-stream relative isolate flex min-h-[440px] w-full min-w-0 flex-col justify-between overflow-hidden border bg-card-midnight p-4 lg:aspect-video lg:min-h-[460px] sm:p-7" aria-label="Sample tournament matchup">
            {disputed && <img src={disputePoster.url} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30" />}
            {!reducedMotion && !videoUnavailable && <video ref={video} src={terminal.url} poster={poster.url} muted playsInline autoPlay preload="auto" onError={() => setVideoUnavailable(true)} aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20" />}
            <div className="theatre-scanlines pointer-events-none absolute inset-0 -z-10" />
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className={`mb-2 text-[10px] font-bold ${disputed ? "text-crimson" : "text-neon-blue"}`}>{disputed ? "CRITICAL // SAMPLE DISPUTE" : "ACTIVE SYSTEM HUD // PREVIEW"}</p><h3 className="text-base font-bold sm:text-lg">{currentProfile.name}</h3><p className="mt-1 text-[10px] text-neon-blue">{currentProfile.mode}</p></div><span className="border border-border bg-card-midnight/90 px-2 py-1 text-[10px] text-muted-foreground">{currentProfile.brackets}</span></div>
            <div className="my-6"><p className="mb-2 text-center text-[10px] text-neon-blue">{BROADCAST_BASELINE.registrationLimit.toLocaleString("en-US")} PLAYER CAPACITY · 1,024 TEAM SLOTS (6v6)</p><p className="mb-3 text-center text-[10px] text-muted-foreground">EXAMPLE MATCHUP // ALPHA VS BETA</p><div className="theatre-matchup grid grid-cols-[minmax(0,1fr)_28px_minmax(0,1fr)] items-center border bg-card-midnight/90 p-3 sm:p-5"><div className="min-w-0 text-center"><p className="text-[9px] text-muted-foreground">ALPHA MATCH SLOT</p><p className="mt-2 break-words text-xs font-bold sm:text-sm">{match.homePlayer}</p><output aria-label="Alpha match score" className="mt-3 block text-5xl font-bold tabular-nums text-neon-blue">{match.homeScore}</output></div><span className="text-center text-[10px] text-muted-foreground">VS</span><div className="min-w-0 text-center"><p className="text-[9px] text-muted-foreground">BETA MATCH SLOT</p><p className="mt-2 break-words text-xs font-bold sm:text-sm">{match.awayPlayer}</p><output aria-label="Beta match score" className="mt-3 block text-5xl font-bold tabular-nums text-neon-blue">{match.awayScore}</output></div></div></div>
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 border-t border-border bg-card-midnight/90 p-3"><div><p className="text-[9px] text-muted-foreground">SAMPLE DELAY BUFFER</p><output aria-label="Sample delay buffer" className={`mt-2 block text-xl font-bold tabular-nums ${disputed ? "text-crimson" : "text-neon-blue"}`}>{String(buffer).padStart(2, "0")}S</output></div><div className="min-w-0 text-right"><p className="text-[9px] text-muted-foreground">CROWDFUNDING BASELINE · NOT LIVE</p><p className="mt-2 text-sm font-bold text-gold sm:text-lg"><span className="block">6v6 {crowdfundBaselineAmount("team")}<span className="block text-[10px] font-normal text-gold/70 sm:inline sm:text-lg sm:font-bold">{` ${CROWDFUND_BASELINE_CAPTION}`}</span></span><span className="block">SOLO {crowdfundBaselineAmount("solo")}<span className="block text-[10px] font-normal text-gold/70 sm:inline sm:text-lg sm:font-bold">{` ${CROWDFUND_BASELINE_CAPTION}`}</span></span></p></div></div>
          </div>
          <div className="flex flex-wrap justify-between gap-2 text-[10px] text-muted-foreground"><span>{disputed ? "VIDEO HOLD // 09.0S" : running ? "LOCAL PREVIEW RUNNING" : "LOCAL PREVIEW PAUSED"}</span><span>{reducedMotion ? "STILL ART // REDUCED MOTION" : videoUnavailable ? "STILL ART // VIDEO UNAVAILABLE" : "TERMINAL VIDEO // MUTED"}</span></div>
        </div>
      </div>
    </section>
  );
}