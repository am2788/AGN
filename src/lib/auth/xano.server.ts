import { EQ_FREQUENCIES, clampEqGain, clampOutputBoost, type EqBandSetting } from "./eq-engine";
import type { AppThemeId } from "../skins/registry";

const XANO_API_PREFIX = "/api:5TJhskz0";
const SESSION_COOKIE = "agn_session";
const COOKIE_MAX_AGE = 60 * 60 * 24;

function config() {
  const base = process.env.XANO_BASE_URL;
  if (!base) throw new Error("XANO_BASE_URL is required");
  return { base: base.replace(/\/$/, ""), groupKey: process.env.XANO_AUTH_GROUP_KEY };
}

async function xano(path: string, init: RequestInit = {}, token?: string): Promise<Record<string, any>> {
  const { base, groupKey } = config();
  const headers = new Headers(init.headers ?? {});
  headers.set("content-type", "application/json");
  if (token) headers.set("authorization", `Bearer ${token}`);
  else if (groupKey) headers.set("authorization", groupKey);

  const response = await fetch(`${base}${XANO_API_PREFIX}${path}`, { ...init, headers });
  const payload = await response.json().catch(() => ({})) as Record<string, any>;
  if (!response.ok) {
    const message = payload?.message ?? payload?.error ?? "Xano request failed";
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return payload;
}

export type AuthUser = { id: string | number; name?: string; email?: string };
export type AuthSession = { token: string; user: AuthUser };

function readToken(payload: Record<string, any>): string {
  const token = payload?.authToken ?? payload?.auth_token ?? payload?.token;
  if (typeof token !== "string" || token.length === 0) {
    throw new Error("Xano did not return an authentication token");
  }
  return token;
}

export async function signupWithXano(input: { name: string; email: string; password: string }): Promise<AuthSession> {
  const signup = await xano("/auth/signup", { method: "POST", body: JSON.stringify(input) });
  const token = readToken(signup);
  const user = await xano("/auth/me", { method: "GET" }, token) as AuthUser;
  if (!user?.id) throw new Error("Xano did not confirm the new session");
  return { token, user };
}

export async function loginWithXano(input: { email: string; password: string }): Promise<AuthSession> {
  const login = await xano("/auth/login", { method: "POST", body: JSON.stringify(input) });
  const token = readToken(login);
  const user = await xano("/auth/me", { method: "GET" }, token) as AuthUser;
  if (!user?.id) throw new Error("Xano did not confirm the login session");
  return { token, user };
}

export function sessionCookie(token: string, secure = process.env.NODE_ENV !== "development"): string {
  const flags = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${COOKIE_MAX_AGE}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (secure) flags.push("Secure");
  return flags.join("; ");
}

export function clearSessionCookie(secure = process.env.NODE_ENV !== "development"): string {
  const base = sessionCookie("", secure);
  return base.replace(`Max-Age=${COOKIE_MAX_AGE}`, "Max-Age=0");
}

export function readSessionCookie(cookieHeader: string | null): string | null {
  const pair = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!pair) return null;
  const value = pair.slice(SESSION_COOKIE.length + 1);
  try {
    return decodeURIComponent(value) || null;
  } catch {
    return null;
  }
}

export async function ensureAetherOnboarding(token: string): Promise<{ threadId: string }> {
  const result = await xano("/onboarding/complete", { method: "POST", body: JSON.stringify({}) }, token);
  const threadId = result?.thread_id ?? result?.threadId;
  if (threadId === undefined || threadId === null) {
    throw new Error("Onboarding did not return a welcome thread id");
  }
  return { threadId: String(threadId) };
}

function errorResponse(error: unknown, fallback: string): Response {
  const status = (error as { status?: number })?.status;
  const httpStatus = Number.isInteger(status) && status! >= 400 && status! < 600 ? status! : 400;
  return Response.json({ error: error instanceof Error ? error.message : fallback }, { status: httpStatus });
}

export async function handleSignup(request: Request): Promise<Response> {
  try {
    const input = await request.json() as { name?: string; email?: string; password?: string };
    if (!input.name?.trim() || !input.email?.trim() || !input.password) {
      return Response.json({ error: "Name, email, and password are required." }, { status: 400 });
    }

    const session = await signupWithXano({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
    });

    const cookie = sessionCookie(session.token);
    try {
      const onboarding = await ensureAetherOnboarding(session.token);
      return Response.json({ user: session.user, threadId: onboarding.threadId }, { headers: { "Set-Cookie": cookie } });
    } catch (error) {
      return Response.json(
        { user: session.user, onboardingPending: true, error: error instanceof Error ? error.message : "Onboarding is pending" },
        { status: 202, headers: { "Set-Cookie": cookie } },
      );
    }
  } catch (error) {
    return errorResponse(error, "Signup failed");
  }
}

export async function handleLogin(request: Request): Promise<Response> {
  try {
    const input = await request.json() as { email?: string; password?: string };
    if (!input.email?.trim() || !input.password) {
      return Response.json({ error: "Email and password are required." }, { status: 400 });
    }

    const session = await loginWithXano({
      email: input.email.trim().toLowerCase(),
      password: input.password,
    });

    return Response.json({ user: session.user }, { headers: { "Set-Cookie": sessionCookie(session.token) } });
  } catch (error) {
    return errorResponse(error, "Login failed");
  }
}

export async function handleMe(request: Request): Promise<Response> {
  const token = readSessionCookie(request.headers.get("cookie"));
  if (!token) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    return Response.json({ user: await xano("/auth/me", { method: "GET" }, token) });
  } catch (error) {
    return errorResponse(error, "Session validation failed");
  }
}

export async function handleOnboardingComplete(request: Request): Promise<Response> {
  const token = readSessionCookie(request.headers.get("cookie"));
  if (!token) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    return Response.json(await ensureAetherOnboarding(token));
  } catch (error) {
    return errorResponse(error, "AETHER onboarding could not be completed");
  }
}

export async function getMyTheme(token: string): Promise<AppThemeId> {
  const result = await xano("/me/theme", { method: "GET" }, token);
  const theme = result?.theme_id ?? result?.theme ?? "skin-gold";
  return theme as AppThemeId;
}

export async function patchMyTheme(token: string, theme: AppThemeId): Promise<void> {
  await xano("/me/theme", { method: "PATCH", body: JSON.stringify({ theme_id: theme }) }, token);
}

export { EQ_FREQUENCIES, clampEqGain, clampOutputBoost };
export type { EqBandSetting };
