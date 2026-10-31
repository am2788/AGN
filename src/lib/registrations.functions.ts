import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const inputSchema = z.object({
  callsign: z.string().trim().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().trim().email().max(255),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ageConfirmed: z.literal(true),
  termsAccepted: z.literal(true),
});

// Saves a registration after the MOCK handshake passes. Real identity
// verification is tracked separately and always starts as "not_started".
export const saveRegistration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const dob = new Date(data.dob);
    const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (Number.isNaN(age) || age < 18) throw new Error("Must be 18 or older");

    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
            h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const id = crypto.randomUUID();
    const { error } = await supabase.from("vault_registrations").insert({
      id,
      callsign: data.callsign,
      email: data.email.toLowerCase(),
      date_of_birth: data.dob,
      age_confirmed: true,
      terms_accepted: true,
      mock_verification_status: "mock_passed",
      identity_verification_status: "not_started",
    });
    if (error) {
      console.error("saveRegistration failed", error);
      throw new Error("Could not save registration");
    }
    return { id };
  });
