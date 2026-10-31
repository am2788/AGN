import { createFileRoute } from "@tanstack/react-router";
import { GatewayTunnel } from "@/components/gateway-tunnel";
export const Route = createFileRoute("/gateway")({
  head: () => ({ meta: [
    { title: "Global Tournament Gateway — Aether Gaming Networks" }, { name: "description", content: "Explore AGN gateway tiers, ID security previews, full and eight-week tournament entry plans, and all-age registration." },
    { property: "og:title", content: "AGN Global Tournament Gateway" }, { property: "og:description", content: "Select your gateway tier, review potential prize categories and explore player rewards. Monetary wagers require verified access." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: GatewayTunnel,
});