import { EQ_FREQUENCIES, clampEqGain, clampOutputBoost, type EqBandSetting } from "./eq-engine";

const XANO_BASE = process.env.XANO_BASE_URL;
const XANO_GROUP_KEY = process.env.XANO_AUTH_GROUP_KEY;
const SESSION_COOKIE = "agn_session";
const COOKIE_MAX_AGE = 60 * 60 * 24;

function config() {
  if (!XANO_BASE) throw new Error("XANO_BASE_URL is required");
  return { base: XANO_BASE.replace(/\/$/, ""), groupKey: XANO_GROUP_KEY };
}
async function xano(path: string, init: RequestInit = {}) {
  const { base, groupKey } = config();
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  if (groupKey) headers.set("Authorization", groupKey);
  const response = await fetch(`${base}/api:5TJhskz0${path}`, { ...init, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message ?? payload.error ?? "Authentication request failed");
  return payload;
}

export type AuthUser = { id: string | number; name?: string; email?: string };
export type AuthSession = { token: string; user: AuthUser };

/** Server-only signup: Xano token never enters browser storage or a client response body. */
export async function signupWithXano(input: { name: string; email: string; password: string }): Promise<AuthSession> {
  const signup = await xano("/auth/signup", { method: "POST", body: JSON.stringify(input) });
  const token = signup.authToken ?? signup.auth_token ?? signup.token;
  if (typeof token !== "string" || token.length === 0) throw new Error("Xano signup did not return a session token");
  const user = await xano("/auth/me", { headers: { authorization: `Bearer ${token}` } }) as AuthUser;
  if (!user?.id) throw new Error("Xano did not confirm the new session");
  return { token, user };
}

/** Use from a server handler; callers return the cookie header and only public user data. */
export function sessionCookie(token: string, secure = true): string {
  const flags = [`${SESSION_COOKIE}=${encodeURIComponent(token)}`, "Path=/", `Max-Age=${COOKIE_MAX_AGE}`, "HttpOnly", "SameSite=Lax"];
  if (secure) flags.push("Secure");
  return flags.join("; ");
}
export function readSessionCookie(cookieHeader: string | null): string | null {
  const pair = cookieHeader?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return pair ? decodeURIComponent(pair.slice(SESSION_COOKIE.length + 1)) : null;
}

/** Preserve state and prevent token exposure; integrate this handler with the app's server router. */
export async function handleSignup(request: Request): Promise<Response> {
  try {
    const input = await request.json() as { name?: string; email?: string; password?: string };
    if (!input.name?.trim() || !input.email?.trim() || !input.password) {
      return Response.json({ error: "Name, email, and password are required." }, { status: 400 });
    }
    const session = await signupWithXano({ name: input.name.trim(), email: input.email.trim(), password: input.password });
    return Response.json({ user: session.user }, { headers: { "Set-Cookie": sessionCookie(session.token) } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Signup failed" }, { status: 400 });
  }
}

export { EQ_FREQUENCIES, clampEqGain, clampOutputBoost };
export type { EqBandSetting };
