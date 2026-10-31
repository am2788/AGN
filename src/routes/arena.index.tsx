import { createFileRoute } from "@tanstack/react-router";
import { ArenaCommandCenter, ArenaSectionView } from "@/components/master-arena-shell";

export const Route = createFileRoute("/arena/")({
  head: () => ({ meta: [
    { title: "Command Center — Aether Gaming Networks" },
    { name: "description", content: "AGN Arena command center with scheduled tournament countdowns, calling cards, media and broadcast previews." },
    { property: "og:title", content: "AGN Arena Command Center" },
    { property: "og:description", content: "Scheduled tournaments, calling cards and the Aether Gaming Networks media deck." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ArenaIndex,
});
function ArenaIndex() {
  const { lane } = Route.useSearch();
  return lane ? <ArenaSectionView key={lane} section="tournaments" lane={lane} /> : <ArenaCommandCenter />;
}