import { createFileRoute } from "@tanstack/react-router";
import { XanoOnboarding } from "@/components/xano-onboarding";
export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode?: "signup" | "signin" } => ({
    mode: search["mode"] === "signup" ? "signup" : "signin",
  }),
  component: AuthPage,
});
function AuthPage() {
  const { mode } = Route.useSearch();
  return <XanoOnboarding signup={mode === "signup"} />;
}
