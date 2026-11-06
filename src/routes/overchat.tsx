import { createFileRoute } from "@tanstack/react-router";
import { XanoAccount } from "@/components/xano-account";
export const Route = createFileRoute("/overchat")({ component: () => <XanoAccount chat /> });
