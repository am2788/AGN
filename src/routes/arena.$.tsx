import { createFileRoute, notFound } from "@tanstack/react-router";
import { ARENA_VIEWS } from "@/lib/arena-shell";
import { ArenaSectionView } from "@/components/master-arena-shell";

export const Route = createFileRoute("/arena/$")({
  beforeLoad: ({ params }) => { if (!ARENA_VIEWS.some((view) => view.slug === params._splat && view.slug !== "")) throw notFound(); },
  head: ({ params }) => {
    const title = ARENA_VIEWS.find((view) => view.slug === params._splat)?.label ?? "Unavailable";
    return { meta: [
      { title: `${title} — AGN Arena` }, { name: "description", content: `Aether Gaming Networks Arena ${title.toLowerCase()} and official tournament resources.` },
      { property: "og:title", content: `${title} — AGN Arena` }, { property: "og:description", content: `Explore ${title.toLowerCase()} in the Aether Gaming Networks Arena.` },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    ] };
  }, component: ArenaView,
});
function ArenaView() { const { _splat } = Route.useParams(); const { lane } = Route.useSearch(); return <ArenaSectionView section={_splat ?? ""} lane={lane} />; }