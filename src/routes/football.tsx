import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, RefreshCw, Trophy, Clock, Radio, AlertCircle } from "lucide-react";
import { getFootballMatches, type FootballMatch } from "@/server/football.functions";

type FootballData = {
  matches: FootballMatch[];
  error: string | null;
  fetchedAt: string;
};

export const Route = createFileRoute("/football")({
  head: () => ({
    meta: [
      { title: "Football — Live Odds | SimBet777" },
      {
        name: "description",
        content:
          "Live football betting odds from top leagues — Premier League, Champions League, La Liga, Serie A, Bundesliga and more. Updated every 60 seconds.",
      },
    ],
  }),
  loader: () => getFootballMatches(),
  staleTime: 30_000,
  errorComponent: ErrorView,
  pendingComponent: PendingView,
  component: FootballPage,
});

function FootballPage() {
  const initial = Route.useLoaderData() as FootballData;
  const [data, setData] = useState<FootballData>(initial);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const refresh = async () => {
      setRefreshing(true);
      try {
        const next = await getFootballMatches();
        setData(next);
      } finally {
        setRefreshing(false);
      }
    };
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, []);

  const liveMatches = data.matches.filter((m) => m.live.inPlay);
  const upcoming = data.matches.filter((m) => !m.live.inPlay && !m.live.completed);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[image:var(--gradient-button)] shadow-[var(--shadow-glow)]">
              <Trophy className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground sm:text-lg">Football Live</h1>
              <p className="text-xs text-muted-foreground">
                {liveMatches.length} live · {upcoming.length} upcoming
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              {refreshing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Updates every 60s
            </span>
            <Link
              to="/dashboard"
              className="rounded-md border border-border bg-background/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {data.error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">{data.error}</p>
              <p className="text-sm text-muted-foreground">
                Make sure the odds service API key is configured.
              </p>
            </div>
          </div>
        )}

        {liveMatches.length > 0 && (
          <section className="mb-8">
            <SectionHeader
              icon={<Radio className="h-4 w-4 animate-pulse text-red-500" />}
              title="Live now"
              count={liveMatches.length}
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {liveMatches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionHeader
            icon={<Clock className="h-4 w-4 text-primary" />}
            title="Upcoming matches"
            count={upcoming.length}
          />
          {upcoming.length === 0 && !data.error ? (
            <p className="rounded-lg border border-border bg-card/40 p-8 text-center text-sm text-muted-foreground">
              No upcoming matches at the moment.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      {icon}
      <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">{title}</h2>
      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

function MatchCard({ match }: { match: FootballMatch }) {
  const start = new Date(match.commenceTime);
  const isLive = match.live.inPlay;

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-4 backdrop-blur transition hover:border-primary/40">
      <div className="flex items-center justify-between">
        <span className="truncate text-xs font-medium text-muted-foreground">{match.league}</span>
        {isLive ? (
          <span className="flex items-center gap-1 rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-[0_0_12px_rgb(239,68,68,0.5)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Live · {match.live.minute}'
          </span>
        ) : (
          <span className="text-xs tabular-nums text-muted-foreground">
            {start.toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <TeamRow name={match.homeTeam} score={match.live.homeScore} live={isLive} />
        <TeamRow name={match.awayTeam} score={match.live.awayScore} live={isLive} />
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1">
        <OddsButton label="1" value={match.odds.home} />
        <OddsButton label="X" value={match.odds.draw} />
        <OddsButton label="2" value={match.odds.away} />
      </div>
    </article>
  );
}

function TeamRow({
  name,
  score,
  live,
}: {
  name: string;
  score: number | null;
  live: boolean;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-[10px] font-bold text-foreground ring-1 ring-border"
          aria-hidden
        >
          {initials}
        </span>
        <span className="truncate text-sm font-semibold text-foreground">{name}</span>
      </div>
      {live && score !== null && (
        <span className="text-base font-bold tabular-nums text-foreground">{score}</span>
      )}
    </div>
  );
}

function OddsButton({ label, value }: { label: string; value: number | null }) {
  const disabled = value === null;
  return (
    <button
      type="button"
      disabled={disabled}
      className="flex flex-col items-center justify-center gap-0.5 rounded-md border border-border bg-background/50 py-2 transition hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-background/50"
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-bold tabular-nums text-foreground">
        {value !== null ? value.toFixed(2) : "—"}
      </span>
    </button>
  );
}

function PendingView() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading live football odds...
      </div>
    </div>
  );
}

function ErrorView({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
        <h2 className="mt-3 text-lg font-bold text-foreground">Could not load matches</h2>
        <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </div>
  );
}
