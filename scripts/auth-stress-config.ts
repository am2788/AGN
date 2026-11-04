import scenario from "../stress-tests/authentication.scenario.json";

/** Resolve once, then reuse for each virtual user. Never log this result. */
export function resolveAuthStressRequest(env: Record<string, string | undefined>) {
  const target = env[scenario.config.target_url_env];
  const password = env[scenario.config.password_env];
  if (!target) throw new Error("Set XANO_AGN_LOGIN_URL to the full AGN login endpoint.");
  const url = new URL(target);
  if (url.protocol !== "https:" || url.pathname === "/" || url.username || url.password || url.search || url.hash) {
    throw new Error("Use the full HTTPS AGN login endpoint without credentials or query tokens.");
  }
  if (!password || password === "YOUR_ALPHA_ACCOUNT_PASSWORD") {
    throw new Error("Set XANO_ALPHA_TEST_PASSWORD to the alpha account's actual test password.");
  }
  return {
    url: url.toString(),
    method: scenario.config.method,
    headers: { ...scenario.config.headers },
    body: JSON.stringify({ email: scenario.config.static_payload.email, password }),
  };
}

export function isAuthStressSuccess(status: number, payload: unknown): boolean {
  if (status !== 200 || !payload || typeof payload !== "object") return false;
  const fields = payload as Record<string, unknown>;
  return ["authToken", "token", "auth_token"].some((field) => {
    const token = fields[field];
    return typeof token === "string" && token.trim().length > 0;
  });
}