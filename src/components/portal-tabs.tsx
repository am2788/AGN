import { Link } from "@tanstack/react-router";

export function PortalTabs() {
  return (
    <nav aria-label="Portal sections" className="mb-10 flex max-w-full flex-wrap justify-center gap-2">
      <Link
        to="/arena"
        activeOptions={{ exact: true }}
        activeProps={{ className: "border-crimson bg-crimson/20 text-foreground" }}
        inactiveProps={{ className: "border-border text-muted-foreground" }}
        className="rounded-sm border px-5 py-2 font-display text-xs font-bold tracking-[0.25em] uppercase"
      >
        Tournaments
      </Link>
      <Link
        to="/wagers"
        activeOptions={{ exact: true }}
        activeProps={{ className: "border-crimson bg-crimson/20 text-foreground" }}
        inactiveProps={{ className: "border-border text-muted-foreground" }}
        className="rounded-sm border px-5 py-2 font-display text-xs font-bold tracking-[0.25em] uppercase"
      >
        Wagers
      </Link>
      <Link
        to="/theatre"
        activeOptions={{ exact: true }}
        activeProps={{ className: "border-crimson bg-crimson/20 text-foreground" }}
        inactiveProps={{ className: "border-border text-muted-foreground" }}
        className="rounded-sm border px-5 py-2 font-display text-xs font-bold tracking-[0.25em] uppercase"
      >
        Theatre
      </Link>
    </nav>
  );
}
