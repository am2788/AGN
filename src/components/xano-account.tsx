import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link, useNavigate } from "@tanstack/react-router";
import { xanoMe, xanoLogout } from "@/lib/xano.functions";
import { ArenaMediaDeck } from "./arena-media-deck";

export function XanoAccount({ chat = false }: { chat?: boolean }) {
  const me = useServerFn(xanoMe);
  const logout = useServerFn(xanoLogout);
  const cache = useQueryClient();
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ["xano-session"],
    queryFn: () => me(),
    retry: false,
    staleTime: 0,
  });
  if (query.isPending) return <p role="status">Checking account access…</p>;
  if (query.error || !query.data)
    return (
      <main>
        <h1>Sign in required</h1>
        <p>Account access also requires configured Xano and session credentials.</p>
        <Link to="/auth">Sign in</Link>
      </main>
    );
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1>{chat ? "Overchat / Messenger" : "Your AGN dashboard"}</h1>
      <p>Welcome, {query.data.name}</p>
      <nav>
        <Link to={chat ? "/dashboard" : "/overchat"}>
          {chat ? "Dashboard" : "Overchat / Messenger"}
        </Link>
        <button
          type="button"
          onClick={() =>
            void logout().then(async () => {
              await cache.cancelQueries();
              cache.clear();
              window.dispatchEvent(new Event("agn-xano-session"));
              await navigate({ to: "/auth", replace: true });
            })
          }
        >
          Sign out
        </button>
      </nav>
      {chat ? (
        <section>
          <h2>AETHER and your connections</h2>
          <p>
            Private messaging requires the authoritative Xano friendship and message endpoints. No
            friendship or welcome message is fabricated locally.
          </p>
        </section>
      ) : (
        <p>
          Identity verified by Xano. Supabase-backed legacy purchases and admin functions remain
          separate until backend migration.
        </p>
      )}
      <ArenaMediaDeck />
    </main>
  );
}
