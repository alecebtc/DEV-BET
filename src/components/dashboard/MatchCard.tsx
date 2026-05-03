import { Star, Tv } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";

export interface Match {
  id: string;
  league: string;
  leagueFlag: string;
  home: string;
  away: string;
  homeScore?: number;
  awayScore?: number;
  minute?: string;
  startTime?: string;
  isLive: boolean;
  hasStream?: boolean;
  odds: { home: number; draw: number; away: number };
}

interface MatchCardProps {
  match: Match;
  onPick: (matchId: string, pick: "1" | "X" | "2", odd: number) => void;
  activePick?: "1" | "X" | "2";
}

function OddButton({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center rounded-md border px-2 py-1.5 text-xs transition-all sm:py-2",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border/50 bg-background/40 hover:border-primary/60 hover:bg-primary/10",
      )}
    >
      <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">
        {label}
      </span>
      <span className="text-sm font-bold tabular-nums">{value.toFixed(2)}</span>
    </button>
  );
}

export function MatchCard({ match, onPick, activePick }: MatchCardProps) {
  const { t } = useLanguage();

  return (
    <article className="group flex flex-col gap-3 rounded-lg border border-border/40 bg-card/70 p-3 backdrop-blur-sm transition-colors hover:border-primary/40 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0" aria-hidden>
            {match.leagueFlag}
          </span>
          <span className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {match.league}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {match.hasStream && (
            <Tv className="size-3.5 text-accent" aria-label="Live stream" />
          )}
          {match.isLive ? (
            <span className="flex items-center gap-1.5 rounded-sm bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-500">
              <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
              LIVE {match.minute}&apos;
            </span>
          ) : (
            <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
              {match.startTime}
            </span>
          )}
          <button
            type="button"
            className="text-muted-foreground/60 transition-colors hover:text-accent"
            aria-label="Favorite"
          >
            <Star className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span className="truncate font-semibold text-foreground">
            {match.home}
          </span>
          <span className="truncate font-semibold text-foreground">
            {match.away}
          </span>
        </div>
        {match.isLive && (
          <div className="flex flex-col items-center gap-1 px-2 text-base font-bold tabular-nums text-primary shrink-0">
            <span>{match.homeScore ?? 0}</span>
            <span>{match.awayScore ?? 0}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <OddButton
          label={t("home")}
          value={match.odds.home}
          active={activePick === "1"}
          onClick={() => onPick(match.id, "1", match.odds.home)}
        />
        <OddButton
          label={t("draw")}
          value={match.odds.draw}
          active={activePick === "X"}
          onClick={() => onPick(match.id, "X", match.odds.draw)}
        />
        <OddButton
          label={t("away")}
          value={match.odds.away}
          active={activePick === "2"}
          onClick={() => onPick(match.id, "2", match.odds.away)}
        />
      </div>
    </article>
  );
}
