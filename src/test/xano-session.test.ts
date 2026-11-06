import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("@tanstack/react-start/server", () => ({ getRequest: vi.fn(), useSession: vi.fn() }));
import { assertSameOrigin, sessionConfig } from "@/lib/xano-session.server";
afterEach(() => vi.unstubAllEnvs());
describe("Xano cookie boundary", () => {
  it("requires at least 32 bytes of hex secret and disables session headers", () => {
    vi.stubEnv("SESSION_SECRET", "");
    expect(() => sessionConfig()).toThrow();
    vi.stubEnv("SESSION_SECRET", "a".repeat(63));
    expect(() => sessionConfig()).toThrow();
    vi.stubEnv("SESSION_SECRET", "fixture-not-a-hex-secret".repeat(4));
    expect(() => sessionConfig()).toThrow();
    vi.stubEnv("SESSION_SECRET", "ab".repeat(32));
    expect(sessionConfig()).toMatchObject({
      name: "__Host-agn-session",
      sessionHeader: false,
      cookie: { httpOnly: true, secure: true, sameSite: "lax", path: "/" },
    });
  });
  it("rejects cross-origin and originless mutation requests", () => {
    expect(() =>
      assertSameOrigin(new Request("https://agn.example/me/theme", { method: "PATCH" })),
    ).toThrow();
    expect(() =>
      assertSameOrigin(
        new Request("https://agn.example/me/theme", {
          headers: { origin: "https://evil.example" },
        }),
      ),
    ).toThrow();
    expect(() =>
      assertSameOrigin(
        new Request("https://agn.example/me/theme", { headers: { origin: "https://agn.example" } }),
      ),
    ).not.toThrow();
  });
});
