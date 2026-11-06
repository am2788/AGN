import { createFileRoute } from "@tanstack/react-router";
import { XanoOnboarding } from "@/components/xano-onboarding";
export const Route = createFileRoute("/signup")({ component: XanoOnboarding });
