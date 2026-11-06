import { afterEach, describe, expect, it, vi } from "vitest";
import { storefrontApiRequest } from "@/lib/shopify.server";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("server-only Shopify configuration", () => {
  it("fails closed before requesting Shopify when no token is configured", async () => {
    vi.stubEnv("SHOPIFY_STOREFRONT_TOKEN", "");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await expect(storefrontApiRequest("query { shop { name } }")).rejects.toThrow(
      "SHOPIFY_STOREFRONT_TOKEN is not configured",
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("uses the runtime token only in the upstream request header", async () => {
    vi.stubEnv("SHOPIFY_STOREFRONT_TOKEN", "test-fixture-only");
    const fetch = vi.fn().mockResolvedValue(Response.json({ data: { shop: { name: "AGN" } } }));
    vi.stubGlobal("fetch", fetch);
    expect(await storefrontApiRequest("query { shop { name } }")).toEqual({
      shop: { name: "AGN" },
    });
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": "test-fixture-only",
        },
      }),
    );
  });
});
