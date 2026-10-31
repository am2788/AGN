import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
const SessionContext = createContext<{ user: User | null; ready: boolean }>({ user: null, ready: false });
export function AccountSession({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => { if (active) { setUser(data.user); setReady(true); } });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setUser(session?.user ?? null); setReady(true);
      void router.invalidate();
      if (event === "SIGNED_OUT") queryClient.clear();
      else void queryClient.invalidateQueries();
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [queryClient, router]);
  return <SessionContext.Provider value={{ user, ready }}>{children}</SessionContext.Provider>;
}
export function useAccountSession() { return useContext(SessionContext); }