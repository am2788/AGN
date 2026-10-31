import { type ReactNode, useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Crosshair, Trophy, Activity, CalendarDays, Swords, Medal, Radio, Users, Newspaper, Vote, MessagesSquare, Settings, PanelLeftClose, PanelLeftOpen, ArrowUpRight, Shield, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AgnCrest } from "@/components/agn-brand";
import { ARENA_VIEWS, arenaClock, nextArenaStart } from "@/lib/arena-shell";
import { crowdfundBaselineLabel } from "@/lib/theatre";
import { ArenaMediaDeck } from "@/components/arena-media-deck";
import { useAccountSession } from "@/components/account-session";
import { CallingCard } from "@/components/calling-card";
import { ArenaPortal } from "@/components/arena-portal";
import { TournamentRegistration } from "@/components/tournament-registration";
import poster from "@/assets/theatre/red_alert_terminal_poster.jpg.asset.json";
import video from "@/assets/theatre/red_alert_terminal.mp4.asset.json";

const icons = [Crosshair, Trophy, Activity, CalendarDays, Swords, Medal, Radio, Users, Newspaper, Vote, MessagesSquare, Settings];

export function MasterArenaShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => { if (window.matchMedia("(max-width: 700px)").matches) setCollapsed(true); }, []);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const selected = ARENA_VIEWS.find((view) => path === `/arena${view.slug ? `/${view.slug}` : ""}`);
  return <div className={`dark arena-shell ${collapsed ? "shell-collapsed" : ""}`}>
    <aside className="shell-sidebar"><Link to="/" className="shell-brand" aria-label="AGN home"><AgnCrest prominent /><span>AETHER GAMING NETWORKS</span></Link><div className="shell-connection"><i />AWAITING LIVE FEED</div>
      <nav aria-label="Arena navigation">{ARENA_VIEWS.map((view, index) => { const Icon = icons[index] ?? Crosshair; return <Button key={view.slug} asChild variant="ghost" className={`shell-nav-item ${selected?.slug === view.slug ? "shell-nav-selected" : ""}`} title={view.label} aria-label={view.label}>{view.slug ? <Link to="/arena/$" params={{ _splat: view.slug }}><Icon /><span>{view.label}</span></Link> : <Link to="/arena"><Icon /><span>{view.label}</span></Link>}</Button>; })}</nav><Link to="/" className="shell-home-link">← PUBLIC HUB</Link>
    </aside>
    <main className="shell-main"><header className="shell-topbar"><Button variant="ghost" size="icon" aria-label={collapsed ? "Expand Arena navigation" : "Collapse Arena navigation"} title={collapsed ? "Expand navigation" : "Collapse navigation"} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}</Button><p>SYSTEM STATUS <span><i />UNCONNECTED</span></p><Link to="/account" className="shell-account"><Shield size={14} />MY ACCOUNT</Link></header>
      <div className="shell-kpis">{["LIVE NOW", "UPCOMING", "REGISTERED", "TOTAL PLAYERS"].map((label) => <div key={label}><span>{label}</span><strong>—</strong><small>{label === "UPCOMING" ? "6 lanes scheduled" : "Feed not connected"}</small></div>)}</div>
      <div className="shell-heading"><h1>ARENA</h1><p>{selected?.label ?? "Arena"}<span /></p></div>
      <div className="shell-viewport">{children}</div>
      <footer className="shell-bottomline"><span>AGN · EWL GROUPS INC.</span><span>ALL TIMES ANCHORED TO UTC</span><Link to="/gateway">REGISTRATION GATEWAY <ArrowUpRight size={12} /></Link></footer>
    </main>
  </div>;
}

function BroadcastPreview() {
  return <section className="shell-frame shell-broadcast"><div className="shell-panel-title"><h2>BROADCAST</h2><span>PREVIEW · NOT LIVE</span></div><video src={video.url} poster={poster.url} controls playsInline muted loop preload="none" aria-label="AGN terminal preview video" /><p className="shell-note">Live source and latency measurement not connected</p></section>;
}
function PrizeValues() {
  return <div className="shell-financials"><section className="shell-frame"><h2>PRIZE POOLS</h2><strong>{crowdfundBaselineLabel("team")}</strong><p>6v6 / squads · configured baseline</p><strong>{crowdfundBaselineLabel("solo")}</strong><p>Solo · configured baseline</p><span className="shell-note">Live funding feed unavailable</span></section><section className="shell-frame"><h2>WAGERS</h2><strong>—</strong><p>Live wager value unavailable</p><Button asChild variant="outline"><Link to="/wagers">Wagerer Vault <ArrowUpRight /></Link></Button></section></div>;
}
export function ArenaCommandCenter() {
  const [now, setNow] = useState<number | null>(null);
  const { user } = useAccountSession();
  useEffect(() => { const tick = () => setNow(Date.now()); tick(); const interval = window.setInterval(tick, 1000); return () => window.clearInterval(interval); }, []);
  const start = now === null ? null : nextArenaStart(now);
  const startLabel = start === null ? "SCHEDULE SYNC PENDING" : `${new Date(start).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).toUpperCase()} · ${new Date(start).toISOString().slice(11, 16)} UTC`;
  return <div className="shell-command-grid"><div className="shell-command-left"><div className="shell-countdown-title"><span>NEXT SCHEDULED TOURNAMENT START</span><small>{startLabel}</small></div><div className="shell-countdown" role="timer" aria-label="Next scheduled tournament countdown">{arenaClock(now).map((part, i) => <div key={i}><strong>{part}</strong><span>{["DAYS", "HOURS", "MINUTES", "SECONDS"][i]}</span></div>)}</div>
    <Tabs defaultValue="card" className="shell-mode-tabs"><TabsList><TabsTrigger value="card">CALLING CARD</TabsTrigger><TabsTrigger value="pools">PRIZE POOLS</TabsTrigger><TabsTrigger value="wagers">WAGERS</TabsTrigger></TabsList><TabsContent value="card"><section className="shell-frame shell-card-slot"><div className="shell-panel-title"><h2>CALLING CARD SLOT</h2><span>ARTWORK PREVIEW</span></div><CallingCard name="AGN PARTICIPANT" points={0} terminalPreview /><p className="shell-note">{user ? "Your personal card is available in My Account." : "Sign in to view your personal calling card."}</p><Button asChild variant="outline"><Link to={user ? "/account" : "/auth"}>{user ? "My calling card" : "Sign in"}<ArrowUpRight /></Link></Button></section></TabsContent><TabsContent value="pools"><PrizeValues /></TabsContent><TabsContent value="wagers"><PrizeValues /></TabsContent></Tabs>
    <ArenaMediaDeck /></div><div className="shell-command-right"><Button asChild variant="outline" className="shell-registration"><Link to="/gateway"><Crosshair />REGISTRATION GATEWAY<ArrowUpRight /></Link></Button><BroadcastPreview /><section className="shell-frame shell-next-match"><div className="shell-panel-title"><h2>NEXT MATCH</h2><span>LINEUP PENDING</span></div><div><AgnCrest /><strong>VS</strong><CircleHelp size={45} /></div><p>AGN <span>Opponent to be announced</span></p></section></div></div>;
}

export function ArenaSectionView({ section, lane }: { section: string; lane?: number | undefined }) {
  const { user } = useAccountSession();
  if (section === "schedule" || section === "tournaments") return <div className="shell-content-section"><ArenaPortal initialLane={lane} />{section === "tournaments" && <TournamentRegistration />}</div>;
  if (section === "prize-pools") return <div className="shell-content-section"><h2>PRIZE POOLS & WAGERS</h2><PrizeValues /></div>;
  if (section === "watch") return <div className="shell-content-section"><BroadcastPreview /><Button asChild variant="outline"><Link to="/theatre">Broadcast Theatre <ArrowUpRight /></Link></Button></div>;
  if (section === "leaderboard") return <div className="shell-content-section"><h2>GLOBAL LEADERBOARD</h2><p>Player brackets and viewer engagement</p><Button asChild variant="outline"><Link to="/leaderboard">Open leaderboard <ArrowUpRight /></Link></Button></div>;
  if (section === "settings") return <div className="shell-content-section"><h2>ACCOUNT SETTINGS</h2><p>Profile, rank cosmetics and saved tournament entries</p><Button asChild variant="outline"><Link to={user ? "/account" : "/auth"}>{user ? "My account" : "Sign in"}<ArrowUpRight /></Link></Button></div>;
  const empty = {
    "system-status": ["SYSTEM STATUS", "Server health, hardware, latency and audience feeds are not connected.", "UNCONNECTED"],
    teams: ["TEAMS", "No verified team roster has been announced.", "ROSTER PENDING"],
    news: ["NEWS", "No official Arena announcements have been posted.", "AWAITING ANNOUNCEMENTS"],
    vote: ["VOTE", "There are no active organizer polls.", "NO ACTIVE POLL"],
    chat: ["CHAT", "Arena chat is not connected.", "OFFLINE"],
  };
  const detail = empty[section as keyof typeof empty] ?? ["ARENA", "This view is unavailable.", "UNAVAILABLE"];
  return <div className="shell-empty"><Activity size={40} /><span>{detail[2]}</span><h2>{detail[0]}</h2><p>{detail[1]}</p>{section === "system-status" && <Button asChild variant="outline"><Link to="/admin">Private admin monitor <ArrowUpRight /></Link></Button>}{section === "teams" && <Button asChild variant="outline"><Link to="/gateway">Tournament registration <ArrowUpRight /></Link></Button>}</div>;
}