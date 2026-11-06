import { createFileRoute } from "@tanstack/react-router";
import { isThemeKey } from "@/lib/theme";

export const Route = createFileRoute("/me/theme")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { readXanoTheme } = await import("@/lib/xano-theme.server");
          return Response.json(await readXanoTheme(), { headers: { "Cache-Control": "no-store" } });
        } catch {
          return Response.json(
            {
              error:
                "Theme unavailable: sign in and ensure the authoritative Xano endpoint is provisioned",
            },
            { status: 503, headers: { "Cache-Control": "no-store" } },
          );
        }
      },
      PATCH: async ({ request }) => {
        const { assertSameOrigin } = await import("@/lib/xano-session.server");
        try {
          assertSameOrigin(request);
        } catch {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
        const theme = body && typeof body === "object" && "theme" in body ? body.theme : undefined;
        if (!isThemeKey(theme))
          return Response.json({ error: "Unsupported theme" }, { status: 400 });
        try {
          const { saveXanoTheme } = await import("@/lib/xano-theme.server");
          return Response.json(await saveXanoTheme(theme), {
            headers: { "Cache-Control": "no-store" },
          });
        } catch {
          return Response.json(
            { error: "Saved theme unavailable; local appearance only" },
            { status: 503, headers: { "Cache-Control": "no-store" } },
          );
        }
      },
    },
  },
});
