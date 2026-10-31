import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Activity, ArrowUpRight, Cpu, Globe, LockKeyhole, Radio, RefreshCw, Server, ShieldCheck, Users, Wrench } from "lucide-react";
import { useAccountSession } from "@/components/account-session";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAdminMonitoring } from "@/lib/admin.functions";
import { RegistrationControlPanel } from "@/components/registration-control-panel";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Private Operations Monitor — AGN" },
    { name: "description", content: "Owner-only AGN operations, account totals, infrastructure and troubleshooting monitor." },
    { property: "og:title", content: "Private Operations Monitor — AGN" },
    { property: "og:description", content: "Restricted Aether Gaming Networks operations dashboard." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex,nofollow" },
  ] }), component: AdminPage,
});

function AdminPage() {
  const { user, ready } = useAccountSession();
  const readMonitor = useServerFn(getAdminMonitoring);
  const query = useQuery({ queryKey: ["admin-monitoring", user?.id], queryFn: () => readMonitor(), enabled: ready && Boolean(user), retry: false });
  const snapshot = query.data?.allowed ? query.data.snapshot : null;
  return <main className="dark min-h-screen bg-vault-bg px-4 py-8 font-body text-foreground sm:px-8"><div className="mx-auto max-w-6xl">
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-wager-line/40 pb-6">
      <div><p className="flex items-center gap-2 text-xs text-crimson"><ShieldCheck className="size-4" /> PRIVATE / AGN OPERATIONS</p><h1 className="mt-3 font-display text-2xl font-bold text-gold sm:text-3xl">Operations monitor</h1></div>
      <div className="flex items-center gap-3"><Button variant="ghost" asChild><Link to="/account">My account <ArrowUpRight /></Link></Button>{snapshot && <Button variant="outline" disabled={query.isFetching} onClick={() => void query.refetch()}><RefreshCw className={query.isFetching ? "motion-safe:animate-spin" : ""} /> Refresh</Button>}</div>
    </header>
    {!ready || (user && query.isPending) ? <p role="status" className="py-12 text-muted-foreground">Checking access…</p> : !user ? <section className="py-12"><LockKeyhole className="size-8 text-crimson" /><h2 className="mt-4 text-xl font-semibold">Private admin access</h2><p className="mt-2 text-muted-foreground">Sign in with your authorized admin account.</p><Button asChild className="mt-6"><Link to="/auth">Sign in</Link></Button></section> : query.error ? <section className="py-12"><p role="alert">{query.error.message}</p><Button className="mt-4" onClick={() => void query.refetch()}>Retry</Button></section> : !snapshot ? <section className="py-12"><LockKeyhole className="size-8 text-crimson" /><h2 className="mt-4 text-xl font-semibold">Admin access required</h2><p className="mt-2 max-w-lg text-muted-foreground">Your account has not been assigned admin access. Player accounts cannot view private monitoring data.</p></section> : <>
      <p className="py-4 text-xs text-muted-foreground">Last checked: {new Date(snapshot.checkedAt).toLocaleString()} · {query.isFetching ? "Refreshing" : "Latest saved account totals"}</p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-y border-border py-6 sm:grid-cols-4">
        {[{ label: "Registered players", value: snapshot.players }, { label: "Viewer accounts", value: snapshot.viewers }, { label: "Saved entries", value: snapshot.registrations }, { label: "Live audience", value: "—" }].map(item => <div key={item.label}><p className="text-xs text-muted-foreground">{item.label}</p><p className="mt-2 font-mono text-3xl text-gold">{item.value}</p></div>)}
      </div>
      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-sm bg-vault-panel">
          <TabsTrigger value="overview"><Activity className="mr-2 size-4" />Overview</TabsTrigger><TabsTrigger value="registration"><Users className="mr-2 size-4" />Registration control</TabsTrigger><TabsTrigger value="servers"><Server className="mr-2 size-4" />Servers & hardware</TabsTrigger><TabsTrigger value="traffic"><Radio className="mr-2 size-4" />Audience & traffic</TabsTrigger><TabsTrigger value="diagnostics"><Wrench className="mr-2 size-4" />Troubleshooting</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="py-6"><h2 className="text-lg font-semibold">Connections</h2><div className="mt-4 divide-y divide-border">
          <Connection icon={Globe} name="topgamer.gg" state="Domain supplied" detail="NicNames · hosting and DNS connection not verified" />
          <Connection icon={ShieldCheck} name="Lovable Cloud" state="Read successful" detail={`Account data · ${snapshot.databaseRoundTripMs} ms server-to-database round trip`} />
          <Connection icon={Server} name="Game servers" state="Not connected" detail="No server monitoring source supplied" />
          <Connection icon={Radio} name="Streaming services" state="Not connected" detail="No provider-verified audience feed" />
        </div></TabsContent>
        <TabsContent value="registration" className="py-6"><RegistrationControlPanel /></TabsContent>
        <TabsContent value="servers" className="py-6"><h2 className="text-lg font-semibold">Server fleet</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="border-b border-border text-muted-foreground"><tr>{["Server / region", "Connection", "Latency", "CPU", "Memory", "Players"].map(x => <th key={x} className="py-3 pr-4 font-normal">{x}</th>)}</tr></thead><tbody><tr><td colSpan={6} className="py-8 text-muted-foreground"><Cpu className="mb-3 size-6" />No connected hardware or game servers.</td></tr></tbody></table></div></TabsContent>
        <TabsContent value="traffic" className="py-6"><h2 className="text-lg font-semibold">Audience & traffic</h2><div className="mt-5 grid gap-8 sm:grid-cols-2"><section><Users className="size-6 text-gold" /><h3 className="mt-3 font-semibold">{snapshot.accounts} registered accounts</h3><p className="mt-2 text-sm text-muted-foreground">{snapshot.players} players · {snapshot.viewers} viewers</p></section><section><Radio className="size-6 text-muted-foreground" /><h3 className="mt-3 font-semibold">Live viewership unavailable</h3><p className="mt-2 text-sm text-muted-foreground">Concurrent viewers, site visits, bandwidth and request rates have no connected telemetry source.</p></section></div></TabsContent>
        <TabsContent value="diagnostics" className="py-6"><h2 className="text-lg font-semibold">Troubleshooting</h2><dl className="mt-5 divide-y divide-border text-sm"><div className="flex justify-between gap-4 py-4"><dt>Account data read</dt><dd className="text-gold">Successful</dd></div><div className="flex justify-between gap-4 py-4"><dt>Paused / pending avatar requests</dt><dd className="font-mono">{snapshot.pausedAvatarRequests}</dd></div><div className="flex justify-between gap-4 py-4"><dt>Hardware alerts & server logs</dt><dd className="text-muted-foreground">Not connected</dd></div></dl><p className="mt-5 text-xs text-muted-foreground">No remote restart or repair actions are enabled.</p></TabsContent>
      </Tabs>
    </>}
  </div></main>;
}

function Connection({ icon: Icon, name, state, detail }: { icon: typeof Globe; name: string; state: string; detail: string }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 py-5"><div className="flex min-w-0 items-start gap-3"><Icon className="mt-1 size-5 shrink-0 text-gold" /><div><h3 className="font-semibold">{name}</h3><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div></div><span className="text-xs text-muted-foreground">{state}</span></div>;
}