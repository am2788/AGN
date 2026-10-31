import { createFileRoute } from "@tanstack/react-router";
import { WelcomeFlame } from "@/components/welcome-flame";

export const Route = createFileRoute("/welcome")({
  validateSearch: (s: Record<string, unknown>): { role?: "spectator" | "competitor" } => ({ role: s["role"] === "competitor" ? "competitor" : "spectator" }),
  head: () => ({
    meta: [
      { title: "Welcome to AGN — Aether Gaming Networks" },
      { name: "description", content: "Your AGN account is ready. Enter the dashboard to chat and vote." },
      { property: "og:title", content: "Welcome to AGN — Aether Gaming Networks" },
      { property: "og:description", content: "Your AGN account is ready. Enter the dashboard to chat and vote." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const { role } = Route.useSearch();
  return <WelcomeFlame role={role ?? "spectator"} />;
}
