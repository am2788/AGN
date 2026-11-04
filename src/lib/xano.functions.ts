import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { xano } from "./xano.server";

// Public reads (no account needed)
export type XanoFormat = "solo" | "team_6" | "zombies_4v4" | "team";
export type XanoFormatStructure = { capacity: number; unit: string; team_size?: number; total_teams?: number };
export type XanoTournament = {
  id: number;
  created_at: number;
  game_id: number;
  name: string;
  format: XanoFormat;
  max_participants: number;
  [key: string]: string | number | boolean | null;
};
export type XanoTournamentsResponse = {
  standard_capacity: number;
  cadence: string;
  format_structures: Partial<Record<"solo" | "team_6" | "zombies_4v4", XanoFormatStructure>>;
  tournaments: XanoTournament[];
};

export const getXanoTournaments = createServerFn({ method: "GET" }).handler(() =>
  xano<XanoTournamentsResponse>("platform", "tournaments"),
);

export const getXanoDashboard = createServerFn({ method: "GET" }).handler(() =>
  xano<{ tournaments: Record<string, string | number | boolean | null>[]; games: Record<string, string | number | boolean | null>[]; first_strike_tracker: { solo_claimed: boolean; team_claimed: boolean } }>(
    "platform",
    "dashboard_state",
  ),
);

export const getXanoBallot = createServerFn({ method: "GET" }).handler(() =>
  xano<{ ballot: { id: number } | null; options: { id: number; name?: string; percent?: number }[] }>("platform", "ballot"),
);

export const getXanoOverchat = createServerFn({ method: "GET" })
  .inputValidator((d: { channel?: string }) => z.object({ channel: z.string().max(40).optional() }).parse(d ?? {}))
  .handler(({ data }) =>
    xano<{ messages: { items: Record<string, string | number | boolean | null>[] } }>("platform", "overchat_messages", {
      query: { channel: data.channel ?? "global", limit: 50 },
    }),
  );

// Xano account auth
const creds = z.object({ email: z.string().email().max(255), password: z.string().min(8).max(128) });

export const xanoLogin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => creds.parse(d))
  .handler(({ data }) => xano<{ authToken: string }>("auth", "auth/login", { body: data }));

export const xanoSignup = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => creds.extend({ name: z.string().trim().min(1).max(60) }).parse(d))
  .handler(({ data }) => xano<{ authToken: string }>("auth", "auth/signup", { body: data }));
