// Server-only Xano client. All Xano traffic goes through here so base URLs and
// tokens never live in browser code.
const XANO_ORIGIN = "https://xr36-ytey-jl5h.n7e.xano.io";
export const XANO_GROUPS = {
  auth: "api:5TJhskz0",
  platform: "api:Ol1Yj_AV",
} as const;

export class XanoError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function xano<T>(
  group: keyof typeof XANO_GROUPS,
  path: string,
  opts: {
    method?: string;
    body?: unknown;
    token?: string;
    query?: Record<string, string | number>;
  } = {},
): Promise<T> {
  const origin = process.env["XANO_BASE_URL"] || process.env["XANO_ORIGIN"] || XANO_ORIGIN;
  const host = new URL(origin);
  if (
    host.protocol !== "https:" ||
    host.username ||
    host.password ||
    host.search ||
    host.hash ||
    host.pathname !== "/"
  )
    throw new Error("XANO_BASE_URL must be an HTTPS instance origin");
  const groupPath =
    process.env[group === "auth" ? "XANO_AUTH_GROUP_KEY" : "XANO_PLATFORM_GROUP_KEY"] ||
    XANO_GROUPS[group];
  if (!/^api:[A-Za-z0-9_-]+$/.test(groupPath))
    throw new Error("Invalid Xano API group canonical path");
  const url = new URL(`${host.origin}/${groupPath}/${path.replace(/^\//, "")}`);
  for (const [k, v] of Object.entries(opts.query ?? {})) url.searchParams.set(k, String(v));
  const headers: Record<string, string> = { accept: "application/json" };
  if (opts.body !== undefined) headers["content-type"] = "application/json";
  if (opts.token) headers["authorization"] = `Bearer ${opts.token}`;
  const res = await fetch(url, {
    method: opts.method ?? (opts.body !== undefined ? "POST" : "GET"),
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : null,
    signal: AbortSignal.timeout(10_000),
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok)
    throw new XanoError(res.status, (json && (json.message as string)) || `Xano ${res.status}`);
  return json as T;
}
