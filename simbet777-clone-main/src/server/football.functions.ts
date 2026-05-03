import { createServerFn } from "@tanstack/react-start";

const SOCCER_LEAGUES = [
  "soccer_epl",
  "soccer_uefa_champs_league",
  "soccer_uefa_europa_league",
  "soccer_spain_la_liga",
  "soccer_italy_serie_a",
  "soccer_germany_bundesliga",
  "soccer_france_ligue_one",
];

const LEAGUE_LABELS: Record<string, string> = {
  soccer_epl: "Premier League",
  soccer_uefa_champs_league: "UEFA Champions League",
  soccer_uefa_europa_league: "UEFA Europa League",
  soccer_spain_la_liga: "La Liga",
  soccer_italy_serie_a: "Serie A",
  soccer_germany_bundesliga: "Bundesliga",
  soccer_france_ligue_one: "Ligue 1",
};

export interface FootballMatch {
  id: string;
  league: string;
  leagueKey: string;
  commenceTime: string; // ISO
  homeTeam: string;
  awayTeam: string;
  odds: { home: number | null; draw: number | null; away: number | null };
  live: {
    inPlay: boolean;
    completed: boolean;
    minute: number | null;
    homeScore: number | null;
    awayScore: number | null;
  };
}

interface OddsApiEvent {
  id: string;
  sport_key: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    markets: Array<{
      key: string;
      outcomes: Array<{ name: string; price: number }>;
    }>;
  }>;
}

interface ScoresApiEvent {
  id: string;
  completed: boolean;
  commence_time: string;
  home_team: string;
  away_team: string;
  scores: Array<{ name: string; score: string }> | null;
}

function pickH2H(ev: OddsApiEvent) {
  // Take first bookmaker with h2h market
  for (const bk of ev.bookmakers ?? []) {
    const m = bk.markets?.find((mm) => mm.key === "h2h");
    if (!m) continue;
    const home = m.outcomes.find((o) => o.name === ev.home_team)?.price ?? null;
    const away = m.outcomes.find((o) => o.name === ev.away_team)?.price ?? null;
    const draw = m.outcomes.find((o) => o.name.toLowerCase() === "draw")?.price ?? null;
    return { home, draw, away };
  }
  return { home: null, draw: null, away: null };
}

async function fetchLeague(leagueKey: string, apiKey: string): Promise<FootballMatch[]> {
  const oddsUrl = new URL(`https://api.the-odds-api.com/v4/sports/${leagueKey}/odds/`);
  oddsUrl.searchParams.set("apiKey", apiKey);
  oddsUrl.searchParams.set("regions", "eu");
  oddsUrl.searchParams.set("markets", "h2h");
  oddsUrl.searchParams.set("oddsFormat", "decimal");
  oddsUrl.searchParams.set("dateFormat", "iso");

  const scoresUrl = new URL(`https://api.the-odds-api.com/v4/sports/${leagueKey}/scores/`);
  scoresUrl.searchParams.set("apiKey", apiKey);
  scoresUrl.searchParams.set("daysFrom", "1");

  const [oddsRes, scoresRes] = await Promise.all([
    fetch(oddsUrl.toString()),
    fetch(scoresUrl.toString()),
  ]);

  if (!oddsRes.ok) {
    console.error(`Odds API error ${leagueKey}: ${oddsRes.status}`);
    return [];
  }
  const odds: OddsApiEvent[] = await oddsRes.json();
  const scores: ScoresApiEvent[] = scoresRes.ok ? await scoresRes.json() : [];
  const scoresById = new Map(scores.map((s) => [s.id, s]));

  const now = Date.now();
  return odds.map((ev) => {
    const sc = scoresById.get(ev.id);
    const start = new Date(ev.commence_time).getTime();
    const inPlay = !!sc && !sc.completed && start <= now;
    const minute = inPlay ? Math.min(120, Math.max(1, Math.floor((now - start) / 60_000))) : null;
    const homeScore = sc?.scores?.find((s) => s.name === ev.home_team)?.score ?? null;
    const awayScore = sc?.scores?.find((s) => s.name === ev.away_team)?.score ?? null;
    return {
      id: ev.id,
      league: LEAGUE_LABELS[leagueKey] ?? leagueKey,
      leagueKey,
      commenceTime: ev.commence_time,
      homeTeam: ev.home_team,
      awayTeam: ev.away_team,
      odds: pickH2H(ev),
      live: {
        inPlay,
        completed: !!sc?.completed,
        minute,
        homeScore: homeScore !== null ? Number(homeScore) : null,
        awayScore: awayScore !== null ? Number(awayScore) : null,
      },
    };
  });
}

export const getFootballMatches = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ matches: FootballMatch[]; error: string | null; fetchedAt: string }> => {
    const apiKey = process.env.THE_ODDS_API_KEY;
    if (!apiKey) {
      return {
        matches: [],
        error: "Football odds service is not configured.",
        fetchedAt: new Date().toISOString(),
      };
    }
    try {
      const all = await Promise.all(SOCCER_LEAGUES.map((l) => fetchLeague(l, apiKey)));
      const matches = all.flat().sort((a, b) => {
        // Live first, then by start time
        if (a.live.inPlay !== b.live.inPlay) return a.live.inPlay ? -1 : 1;
        return new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime();
      });
      return { matches, error: null, fetchedAt: new Date().toISOString() };
    } catch (e) {
      console.error("Football fetch failed:", e);
      return {
        matches: [],
        error: "Failed to load football matches. Please try again.",
        fetchedAt: new Date().toISOString(),
      };
    }
  },
);
