import { describe, expect, it } from "vitest";
import { isAuthStressSuccess, resolveAuthStressRequest } from "../../scripts/auth-stress-config";

// Synthetic local fixture only; not an account credential or a live request.
const env = {
  XANO_AGN_LOGIN_URL: "https://example.test/api:agn/auth/login",
  XANO_ALPHA_TEST_PASSWORD: "local-fixture-only",
};

describe("AGN authentication stress-test bindings", () => {
  it("sends the exact alpha email rather than a mock token", () => {
    expect(JSON.parse(resolveAuthStressRequest(env).body).email).toBe("agn.test.alpha@outlook.com");
  });
  it("maps the password string unchanged from its separate environment value", () => {
    expect(JSON.parse(resolveAuthStressRequest(env).body).password).toBe(env.XANO_ALPHA_TEST_PASSWORD);
  });
  it("keeps identical credentials across virtual-user iterations", () => {
    expect(resolveAuthStressRequest(env).body).toBe(resolveAuthStressRequest(env).body);
  });
  it("blocks a missing or placeholder password", () => {
    expect(() => resolveAuthStressRequest({ ...env, XANO_ALPHA_TEST_PASSWORD: undefined })).toThrow();
    expect(() => resolveAuthStressRequest({ ...env, XANO_ALPHA_TEST_PASSWORD: "YOUR_ALPHA_ACCOUNT_PASSWORD" })).toThrow();
  });
  it("blocks the supplied marketing homepage as a login target", () => {
    expect(() => resolveAuthStressRequest({ ...env, XANO_AGN_LOGIN_URL: "https://xano.io" })).toThrow();
  });
  it.each(["authToken", "token", "auth_token"])("recognizes HTTP 200 with %s", (field) => {
    expect(isAuthStressSuccess(200, { [field]: "synthetic-response-fixture" })).toBe(true);
  });
  it("rejects errors and empty or non-string tokens", () => {
    expect(isAuthStressSuccess(401, { token: "synthetic-response-fixture" })).toBe(false);
    expect(isAuthStressSuccess(200, { token: " " })).toBe(false);
    expect(isAuthStressSuccess(200, { authToken: 123 })).toBe(false);
  });
});