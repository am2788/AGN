import { createFileRoute } from "@tanstack/react-router";
import { ArenaTheatre } from "@/components/arena-theatre";
import { PortalTabs } from "@/components/portal-tabs";
import AgnRefinedViewport from "@/components/agn-refined-viewport";

const TITLE = "AGN — Broadcast Theatre";
const DESC = "Explore the AGN Broadcast Theatre with a terminal video, interactive sample match controls and mechanical stage shutters.";

export const Route = createFileRoute("/theatre")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TheatrePage,
});

function TheatrePage() {
  return (
    <div className="dark vault-grain min-h-screen bg-vault-bg font-body text-foreground">
      <main className="mx-auto flex w-full max-w-[1440px] flex-col items-center px-4 py-8 sm:px-8 sm:py-10">
        <header className="mb-10 text-center">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">EWL Groups Inc. presents</p>
          <h1 className="text-glow-gold mt-3 font-display text-4xl font-bold text-gold sm:text-5xl">AETHER GAMING NETWORKS</h1>
          <p className="mt-3 text-xs uppercase text-crimson">Broadcast Theatre</p>
        </header>
        <PortalTabs />
        <AgnRefinedViewport />
        <div className="mt-12 flex w-full flex-col items-center border-t border-border pt-8">
          <h2 className="mb-5 font-mono text-xs text-muted-foreground">AGN STAGE // SHUTTER PREVIEW</h2>
          <ArenaTheatre />
        </div>
      </main>
    </div>
  );
}
