import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Home, UserPlus, LogIn, ShoppingBag, Swords, Youtube, Twitch, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgnCrest } from "@/components/agn-brand";
import { ScheduleHelper } from "@/components/schedule-helper";
import { MASTER_DEADLINE, countdownSeconds, formatCountdown, laneRegionalSchedule, LANE_CAPACITY } from "@/lib/arena";
import backdrop from "@/assets/agn-hub-sanctum.jpg";
import covers from "@/assets/tournament-covers.jpg";

const games = [
  { lane: 2, title: "MW4 SOLO", mode: "1v1 · Tactical", date: "27 NOV" },
  { lane: 1, title: "MW4 TEAM", mode: "6v6 · Multiplayer", date: "23 NOV" },
  { lane: 3, title: "ZOMBIES SOLO", mode: "Solo · Extraction speedrun", date: "23 NOV" },
  { lane: 4, title: "ZOMBIES QUAD", mode: "4-player · Survival ladder", date: "23 NOV" },
  { lane: 5, title: "FORTNITE ARENA", mode: "6v6 · Zero-Build", date: "25 NOV" },
  { lane: 6, title: "SF6 SOLO", mode: "1v1 · Double elimination", date: "24 NOV" },
] as const;

export function PublicGameHub() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick(); const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);
  return (
    <div className="dark agn-hub min-h-screen font-body text-foreground">
      <img className="hub-backdrop" src={backdrop} width={1920} height={1024} alt="" />
      <nav className="hub-nav" aria-label="Main navigation">
        <span className="hub-nav-brand">AGN <span>GLOBAL ARENA</span></span>
        <Button asChild variant="ghost" className="hub-nav-link"><Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "hub-nav-active" }}><Home />HOME</Link></Button>
        <Button asChild variant="ghost" className="hub-nav-link"><Link to="/join"><UserPlus />SIGN UP</Link></Button>
        <Button asChild variant="ghost" className="hub-nav-link"><Link to="/auth" search={{ mode: "signin" }}><LogIn />SIGN IN</Link></Button>
        <Button asChild variant="ghost" className="hub-nav-link"><Link to="/hub"><MessageCircle />OVERCHAT</Link></Button>
        <Button asChild variant="ghost" className="hub-nav-link"><Link to="/shop"><ShoppingBag />MERCH</Link></Button>
        <Button asChild variant="ghost" className="hub-nav-link"><Link to="/arena"><Swords /><span>UPCOMING <br />TOURNAMENTS</span></Link></Button>
        <span className="hub-nav-foot">EWL GROUPS INC.</span>
      </nav>
      <main className="hub-main">
        <header className="hub-hero">
          <p className="hub-eyebrow">ENVIRONMENTAL WELLNESS LAB GROUPS INC. PRESENTS</p>
          <div className="hub-master-crest"><AgnCrest prominent /></div>
          <h1>AETHER GAMING<br />NETWORKS</h1>
          <p className="hub-hero-subtitle">GLOBAL TOURNAMENT ARENA</p>
          <div className="hub-clock-wrap">
            <p className="hub-eyebrow">MASTER OVER-CLOCK</p>
            <div role="timer" aria-label="Countdown to October 21, 2026 at 00:00 UTC" className="hub-clock arena-timer">{now === null ? "--:--:--" : formatCountdown(countdownSeconds(MASTER_DEADLINE, now))}</div>
            <p className="hub-clock-date">Official site / trailer drop · 21 October 2026 · 00:00 UTC</p>
          </div>
        </header>
        <section className="hub-schedule" aria-labelledby="hub-schedule-title">
          <div className="hub-section-heading"><div><p className="hub-eyebrow">THE NEXT CHAPTER STARTS HERE</p><h2 id="hub-schedule-title">AGN GLOBAL TOURNAMENT SCHEDULE</h2></div><span className="hub-season">NOVEMBER 2026</span></div>
          <ScheduleHelper />
          <div className="hub-game-grid">
            {games.map((game) => (
              <article className="hub-game-card" key={game.lane}>
                <div className={`hub-game-art arena-cover-${game.lane}`}><img src={covers} className="arena-cover-sheet" width={1536} height={1024} alt={`${game.title} tournament artwork`} loading="lazy" /><span className="hub-game-date">{game.date}</span></div>
                <div className="hub-game-info"><p className="hub-game-status">UPCOMING</p><h3>{game.title}</h3><p className="hub-game-mode">{game.mode}</p><p className="hub-game-capacity">{LANE_CAPACITY.toLocaleString("en-US")} PLAYER CAPACITY</p>
                  <Button asChild variant="outline" className="hub-game-cta"><Link to="/arena" search={{ lane: game.lane }}>VIEW TOURNAMENT <ArrowUpRight /></Link></Button>
                </div>
              </article>
            ))}
          </div>
          <div className="hub-regions">{laneRegionalSchedule(1).map((region) => <p key={region.region}><span>{region.region === "ASIA" ? "ASIA · TOKYO" : region.region === "EU" ? "EUROPE" : "AMERICAS · EST"}</span>{region.utcWindow}</p>)}<p><span>CHECK-IN & AIR TIME</span>15 minutes before tournament start</p></div>
        </section>
        <footer className="hub-footer">
          <div><h2>AETHER GAMING NETWORKS</h2><p>Uniting warriors across every realm.<br />Compete. Conquer. Be Legendary.</p></div>
          <div><h2>QUICK LINKS</h2><Link to="/arena">Upcoming Tournaments</Link><Link to="/auth" search={{ mode: "signin" }}>Sign In</Link><Link to="/leaderboard">Leaderboard</Link><Link to="/wagers">Wagers</Link><Link to="/theatre">Broadcast Theatre</Link></div>
          <div><h2>FOLLOW US</h2><div className="hub-socials">{[{ name: "X", icon: ArrowUpRight }, { name: "Discord", icon: MessageCircle }, { name: "YouTube", icon: Youtube }, { name: "Twitch", icon: Twitch }].map(({ name, icon: Icon }) => <Button key={name} variant="outline" size="icon" disabled title={`${name} · official link pending`} aria-label={`${name} · official link pending`}><Icon /></Button>)}</div></div>
          <div><h2>CONTACT US</h2><a href="mailto:support@aethergaming.net"><Mail size={14} />support@aethergaming.net</a><a href="https://topgamer.gg">topgamer.gg</a></div>
          <p className="hub-copyright">© 2026 AETHER GAMING NETWORKS · EWL GROUPS INC. ALL RIGHTS RESERVED.</p>
        </footer>
      </main>
    </div>
  );
}