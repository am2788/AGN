import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ xano: vi.fn(), requireUser: vi.fn() }));
vi.mock("@/lib/xano.server", () => ({ xano: mocks.xano }));
vi.mock("@/lib/xano-session.server", () => ({ requireXanoUser: mocks.requireUser }));
import { readXanoTheme, saveXanoTheme } from "@/lib/xano-theme.server";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
describe("authoritative Xano theme contract", () => {
  it("normalizes theme_id and sends only the theme for the authenticated owner", async () => {
    vi.stubEnv("XANO_THEME_ENDPOINT_ENABLED", "true");
    mocks.requireUser.mockResolvedValue({ user: { id: 7 }, token: "fixture-token-only" });
    mocks.xano.mockResolvedValue({ theme_id: "skin-cyber" });
    expect(await readXanoTheme()).toEqual({ theme: "skin-cyber" });
    expect(await saveXanoTheme("skin-cyber")).toEqual({ theme: "skin-cyber" });
    expect(mocks.xano).toHaveBeenLastCalledWith("platform", "me/theme", {
      token: "fixture-token-only",
      method: "PATCH",
      body: { theme_id: "skin-cyber" },
    });
  });
  it("fails closed before proxying to an unverified backend", async () => {
    vi.stubEnv("XANO_THEME_ENDPOINT_ENABLED", "false");
    mocks.requireUser.mockResolvedValue({ user: { id: 7 }, token: "fixture-token-only" });
    await expect(readXanoTheme()).rejects.toThrow("not provisioned");
    expect(mocks.xano).not.toHaveBeenCalled();
  });
});
