import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
export async function authenticateAvatarRequest(request: Request, url: string, key: string) {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  const client = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: authorization }, fetch: (input, init) => { const headers = new Headers(init?.headers); headers.set("apikey", key); return fetch(input, { ...init, headers }); } } });
  const { data, error } = await client.auth.getUser(authorization.slice(7));
  return error || !data.user ? null : { client, userId: data.user.id };
}