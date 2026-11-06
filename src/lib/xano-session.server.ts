import { getRequest, useSession as getSessionManager } from "@tanstack/react-start/server";
import { xano } from "./xano.server";

export function sessionConfig() {
  const secret = process.env["SESSION_SECRET"];
  if (!secret || !/^[a-f0-9]{64,}$/i.test(secret))
    throw new Error("SESSION_SECRET must be at least 32 random bytes encoded as hex");
  return {
    name: "__Host-agn-session",
    password: secret,
    maxAge: 86400,
    sessionHeader: false as const,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}
export function assertSameOrigin(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    throw new Error("Cross-origin mutation rejected");
}
export async function xanoSession() {
  return getSessionManager<{ token: string }>(sessionConfig());
}
export async function requireXanoUser() {
  const session = await xanoSession();
  if (!session.data.token) throw new Error("Authentication required");
  const user = await xano<{ id: number; name: string; email: string }>("auth", "auth/me", {
    token: session.data.token,
  });
  if (!Number.isSafeInteger(user.id) || user.id <= 0) throw new Error("Invalid authenticated user");
  return { user, token: session.data.token };
}
export function assertMutationOrigin() {
  assertSameOrigin(getRequest());
}
