import { Link, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccountSession } from "@/components/account-session";
import { supabase } from "@/integrations/supabase/client";
import crest from "@/assets/Aether_Gaming_gold_Poster.png.asset.json";

export function AgnCrest({ prominent = false }: { prominent?: boolean }) {
  return (
    <img
      src={crest.url}
      alt="Aether Gaming Networks gold poster with ruby crest and AGN lettering"
      width={1920}
      height={1080}
      decoding="async"
      className={prominent ? "mx-auto block h-auto w-full max-w-[320px] object-contain sm:max-w-[560px]" : "block h-10 w-auto max-w-full shrink-0 object-contain"}
    />
  );
}

export function AgnNavigation() {
  const isHome = useRouterState({ select: (state) => state.location.pathname === "/" || state.location.pathname === "/gateway" || state.location.pathname === "/arena" || state.location.pathname.startsWith("/arena/") });
  const { user } = useAccountSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    await queryClient.cancelQueries(); queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }
  if (isHome) return null;
  return (
    <header className="dark border-b border-wager-line/40 bg-vault-bg font-body text-foreground">
      <nav aria-label="Main navigation" className="tap-flash-none mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-3 gap-y-0.5 px-3 pt-1 pb-2 sm:px-8 sm:py-3">
        <Link to="/" className="flex min-w-0 grow basis-full items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-crimson focus-visible:outline-offset-[-2px] sm:focus-visible:outline-offset-2 sm:basis-auto sm:flex-none sm:gap-3">
          <AgnCrest />
          <span className="min-w-0 font-display text-[13px] font-bold leading-tight text-gold text-balance sm:text-base">
            Aether Gaming Networks
            <span className="block font-body text-[10px] font-normal leading-[1.15] text-muted-foreground text-balance sm:mt-0 sm:whitespace-nowrap">AGN · EWL Groups Inc.</span>
          </span>
        </Link>
        <div className="flex basis-full flex-wrap items-center justify-between gap-2 text-xs">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="border-b-2 -mx-1.5 -mt-1 px-1.5 py-1 touch-manipulation select-none transition-[color,border-color,background-color,translate,scale] active:bg-wager-line/12 motion-safe:active:translate-y-px motion-safe:active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-crimson focus-visible:outline-offset-[-2px] sm:focus-visible:outline-offset-2"
            activeProps={{ className: "border-wager-line text-gold" }}
            inactiveProps={{ className: "border-transparent text-foreground/80 hover:text-gold" }}
          >
            Arena
          </Link>
          <Link
            to="/wagers"
            activeOptions={{ exact: true }}
            className="border-b-2 -mx-1.5 -mt-1 px-1.5 py-1 touch-manipulation select-none transition-[color,border-color,background-color,translate,scale] active:bg-wager-line/12 motion-safe:active:translate-y-px motion-safe:active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-crimson focus-visible:outline-offset-[-2px] sm:focus-visible:outline-offset-2"
            activeProps={{ className: "border-wager-line text-gold" }}
            inactiveProps={{ className: "border-transparent text-foreground/80 hover:text-gold" }}
          >
            Wagers
          </Link>
          <Link
            to="/console"
            className="border-b-2 -mx-1.5 -mt-1 px-1.5 py-1 touch-manipulation select-none transition-[color,border-color,background-color,translate,scale] active:bg-wager-line/12 motion-safe:active:translate-y-px motion-safe:active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-crimson focus-visible:outline-offset-[-2px] sm:focus-visible:outline-offset-2"
            activeProps={{ className: "border-wager-line text-gold" }}
            inactiveProps={{ className: "border-transparent text-foreground/80 hover:text-gold" }}
          >
            Secure Console
          </Link>
          <Link to="/shop" className="py-1 text-foreground/80 hover:text-gold focus-visible:outline-2 focus-visible:outline-crimson">Merch</Link>
          <Link to={user ? "/account" : "/auth"} className="py-1 text-gold focus-visible:outline-2 focus-visible:outline-crimson">{user ? "My account" : "Sign in"}</Link>
          {user && <Button type="button" variant="ghost" size="icon" title="Sign out" aria-label="Sign out" onClick={() => void signOut()}><LogOut /></Button>}
        </div>
      </nav>
    </header>
  );
}

export function AgnSecurityBadge() {
  return (
    <div className="flex items-center gap-3 border-b border-wager-line/30 pb-4">
      <div className="opacity-75"><AgnCrest /></div>
      <p className="text-xs text-gold">AGN Secure Console<span className="mt-1 block text-[10px] text-muted-foreground">EWL Groups Inc.</span></p>
    </div>
  );
}