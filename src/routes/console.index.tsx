import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CONSOLE_ASSET_IDS } from "@/lib/console-assets.functions";
import { AgnSecurityBadge } from "@/components/agn-brand";
import { LeaderboardPanel } from "@/components/leaderboard-panel";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/console/")({
  head: () => ({
    meta: [
      { title: "Secure Console — AGN" },
      { name: "description", content: "Your AGN secure console and saved artwork." },
      { property: "og:title", content: "Secure Console — AGN" },
      { property: "og:description", content: "AGN signed-in console." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ConsoleHome,
});

function ConsoleHome() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);
  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  };
  return (
    <main className="dark vault-grain min-h-screen bg-vault-bg px-6 py-12 font-body text-foreground">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5"><AgnSecurityBadge /></div>
        <Link to="/" className="text-xs tracking-[0.3em] text-muted-foreground uppercase">← Arena</Link>
        <h1 className="text-glow-gold mt-4 font-display text-3xl font-bold tracking-widest text-gold">SECURE CONSOLE</h1>
        {email === undefined ? (
          <p className="mt-6 text-sm text-muted-foreground">Checking console access…</p>
        ) : email === null ? (
          <div className="mt-8 text-center">
            <LockKeyhole className="mx-auto mb-4 h-6 w-6 text-crimson" />
            <p className="text-sm text-muted-foreground">Sign in to open your console.</p>
            <Link to="/auth" className="mt-4 inline-block rounded-md bg-crimson px-5 py-2 font-display text-sm tracking-widest">SIGN IN</Link>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">Signed in as {email}</p>
            <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {CONSOLE_ASSET_IDS.map((id, i) => (
                <li key={id}>
                  <Link to="/console/assets/$asset" params={{ asset: id }}
                    className="arena-border block rounded-xl bg-vault-panel p-5 text-center font-display text-sm tracking-widest text-gold">
                    CANVA SCREEN {String(i + 1).padStart(2, "0")}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/account" className="my-6 inline-block text-sm text-gold underline">Your profile, rewards &amp; entries</Link>
            <LeaderboardPanel />
            <Button variant="ghost" onClick={() => void signOut()} className="mt-10 text-xs text-muted-foreground underline">Sign out</Button>
          </>
        )}
      </div>
    </main>
  );
}
