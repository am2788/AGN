import { createFileRoute } from "@tanstack/react-router";
import { WagerSection } from "@/components/wager-section";
import { PortalTabs } from "@/components/portal-tabs";

export const Route = createFileRoute("/wagers")({
  head: () => ({
    meta: [
      { title: "AGN — Wagerer Vault" },
      {
        name: "description",
        content:
          "The AGN Wagerer Vault: select a matchup, choose your tier, and lock in. An EWL Groups Inc. property.",
      },
      { property: "og:title", content: "AGN — Wagerer Vault" },
      {
        property: "og:description",
        content:
          "The AGN Wagerer Vault: select a matchup, choose your tier, and lock in. An EWL Groups Inc. property.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WagersPage,
});

function WagersPage() {
  return (
    <div className="dark vault-grain min-h-screen bg-vault-bg font-body text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col items-center px-4 py-8 sm:px-8 sm:py-10">
        <header className="mb-10 text-center">
          <p className="text-[11px] font-medium tracking-[0.4em] text-muted-foreground uppercase">
            EWL Groups Inc. presents
          </p>
          <h1 className="text-glow-gold mt-3 font-display text-4xl font-bold tracking-[0.12em] text-gold sm:text-5xl">
            AETHER GAMING NETWORKS
          </h1>
          <p className="mt-3 text-xs text-crimson uppercase">Wagerer Vault</p>
        </header>

        <PortalTabs />
        <WagerSection />

        <footer className="mt-8 text-center text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
          AGN Registration v9.0 — © 2026 EWL Groups Inc.
        </footer>
      </div>
    </div>
  );
}
