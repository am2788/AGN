import { createFileRoute } from "@tanstack/react-router";
import { OverchatHub } from "@/components/overchat-hub";

export const Route = createFileRoute("/hub")({
  head: () => ({
    meta: [
      { title: "AGN Overchat Dashboard — Chat & Vote" },
      { name: "description", content: "Chat with the AGN community and vote on next season's tournament titles." },
      { property: "og:title", content: "AGN Overchat Dashboard — Chat & Vote" },
      { property: "og:description", content: "Chat with the AGN community and vote on next season's tournament titles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OverchatHub,
});
