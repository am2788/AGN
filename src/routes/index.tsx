import { createFileRoute } from "@tanstack/react-router";
import { PublicGameHub } from "@/components/public-game-hub";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aether Gaming Networks — Global Tournament Hub" },
      {
        name: "description",
        content:
          "The AGN Main Arena Portal: six competitive lanes, Master Over-Clock, and all-age tournament registration. An EWL Groups Inc. property.",
      },
      { property: "og:title", content: "Aether Gaming Networks — Global Tournament Hub" },
      {
        property: "og:description",
        content:
          "The AGN Main Arena Portal: six competitive lanes, Master Over-Clock, and all-age tournament registration. An EWL Groups Inc. property.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return <PublicGameHub />;
}
