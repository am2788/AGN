import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Canva console screens live in the private "console-assets" bucket.
// Lane 3 uses the supplied second copy of skin 5 (no skin 3 was supplied).
export const CONSOLE_ASSET_IDS = ["skin-1", "skin-2", "skin-3", "skin-4", "skin-5", "skin-6"] as const;

export const getConsoleAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ asset: z.enum(CONSOLE_ASSET_IDS) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const base = `arena-${data.asset}`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from("console-assets")
      .createSignedUrls([`${base}.jpg`, `${base}.webm`, `${base}.mp4`], 600);
    if (error || !signed || signed.some((s) => !s.signedUrl)) {
      console.error("console asset signing failed", error);
      throw new Error("Artwork unavailable");
    }
    const [poster, webm, video] = signed.map((s) => s.signedUrl);
    return { poster: poster!, webm: webm!, video: video! };
  });
