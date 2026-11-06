import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { xano } from "./xano.server";

// Public reads (no account needed)
export type XanoFormat = "solo" | "team_6" | "zombies_4v4" | "team";
export type XanoFormatStructure = {
  capacity: number;
  unit: string;
  team_size?: number;
  total_teams?: number;
};
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
  xano<{
    tournaments: Record<string, string | number | boolean | null>[];
    games: Record<string, string | number | boolean | null>[];
    first_strike_tracker: { solo_claimed: boolean; team_claimed: boolean };
  }>("platform", "dashboard_state"),
);

export const getXanoBallot = createServerFn({ method: "GET" }).handler(() =>
  xano<{
    ballot: { id: number } | null;
    options: { id: number; name?: string; percent?: number }[];
  }>("platform", "ballot"),
);

export const getXanoOverchat = createServerFn({ method: "GET" })
  .inputValidator((d: { channel?: string }) =>
    z.object({ channel: z.string().max(40).optional() }).parse(d ?? {}),
  )
  .handler(({ data }) =>
    xano<{ messages: { items: Record<string, string | number | boolean | null>[] } }>(
      "platform",
      "overchat_messages",
      {
        query: { channel: data.channel ?? "global", limit: 50 },
      },
    ),
  );

// Tokens are sealed into HttpOnly cookies and never returned to the client.
const creds = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});
async function authenticate(
  data: { email: string; password: string; name?: string },
  signup: boolean,
) {
  const { assertMutationOrigin, xanoSession } = await import("./xano-session.server");
  assertMutationOrigin();
  const session = await xanoSession(); // Validate session configuration before creating an account.
  const result = await xano<{ authToken: string }>("auth", signup ? "auth/signup" : "auth/login", {
    body: data,
  });
  if (!result.authToken || result.authToken.length > 3000)
    throw new Error("Invalid authentication response");
  const user = await xano<{ id: number; name: string; email: string }>("auth", "auth/me", {
    token: result.authToken,
  });
  if (!Number.isSafeInteger(user.id) || user.id <= 0) throw new Error("Invalid authenticated user");
  await session.clear();
  await session.update({ token: result.authToken });
  return { id: user.id, name: user.name };
}
export const xanoLogin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => creds.parse(d))
  .handler(({ data }) => authenticate(data, false));
export const xanoSignup = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => creds.extend({ name: z.string().trim().min(2).max(60) }).parse(d))
  .handler(({ data }) => authenticate(data, true));
export const xanoMe = createServerFn({ method: "GET" }).handler(async () => {
  const { requireXanoUser } = await import("./xano-session.server");
  const { user } = await requireXanoUser();
  return { id: user.id, name: user.name };
});
export const xanoLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { assertMutationOrigin, xanoSession } = await import("./xano-session.server");
  assertMutationOrigin();
  await (await xanoSession()).clear();
  return { signedOut: true };
});
