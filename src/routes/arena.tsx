import { Outlet, createFileRoute } from "@tanstack/react-router";
import { MasterArenaShell } from "@/components/master-arena-shell";

export const Route = createFileRoute("/arena")({
  validateSearch: (search: Record<string, unknown>): { lane?: number } => {
    const lane = Number(search["lane"]);
    return Number.isInteger(lane) && lane >= 1 && lane <= 6 ? { lane } : {};
  },
  head: () => ({ meta: [
    { title: "Tournament Arena & Registration — AGN" },
    { name: "description", content: "Explore AGN's six tournament brackets, regional start times, rules and all-age registration." },
    { property: "og:title", content: "Tournament Arena & Registration — AGN" },
    { property: "og:description", content: "Six competitive brackets with regional schedules and all-age tournament entry at Aether Gaming Networks." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ArenaPage,
});

function ArenaPage() {
  return <MasterArenaShell><Outlet /></MasterArenaShell>;
}