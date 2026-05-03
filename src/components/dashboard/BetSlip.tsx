import { useState } from "react";
import { Ticket, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/use-language";
import { toast } from "sonner";

export interface BetSelection {
  matchId: string;
  matchLabel: string;
  pick: "1" | "X" | "2";
  odd: number;
}

interface BetSlipProps {
  selections: BetSelection[];
  onRemove: (matchId: string) => void;
  onClear: () => void;
}

export function BetSlip({ selections, onRemove, onClear }: BetSlipProps) {
  const { t } = useLanguage();
  const [stake, setStake] = useState<string>("");
  const stakeNum = Number(stake) || 0;
  const totalOdds = selections.reduce((acc, s) => acc * s.odd, 1);
  const potential = stakeNum * totalOdds;

  const handlePlace = () => {
    if (selections.length === 0 || stakeNum <= 0) return;
    toast.success(`${t("placeBet")} · $${potential.toFixed(2)}`);
    onClear();
    setStake("");
  };

  return (
    <aside className="flex h-full flex-col rounded-lg border border-border/40 bg-card/70 p-4 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <Ticket className="size-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            {t("betSlip")}
          </h2>
          {selections.length > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground tabular-nums">
              {selections.length}
            </span>
          )}
        </div>
        {selections.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[11px] text-muted-foreground transition-colors hover:text-primary"
          >
            Clear
          </button>
        )}
      </div>

      {selections.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <Ticket className="size-8 text-muted-foreground/40" />
          <p className="px-4 text-xs text-muted-foreground">
            {t("emptyBetSlip")}
          </p>
        </div>
      ) : (
        <>
          <ul className="flex-1 space-y-2 overflow-y-auto py-3">
            {selections.map((s) => (
              <li
                key={s.matchId}
                className="rounded-md border border-border/40 bg-background/40 p-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">
                      {s.matchLabel}
                    </p>
                    <p className="mt-0.5 text-[10px] uppercase text-muted-foreground">
                      Pick: {s.pick}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(s.matchId)}
                    className="text-muted-foreground transition-colors hover:text-primary"
                    aria-label="Remove"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <div className="mt-1 text-end text-sm font-bold tabular-nums text-primary">
                  {s.odd.toFixed(2)}
                </div>
              </li>
            ))}
          </ul>

          <div className="space-y-3 border-t border-border/40 pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total Odds</span>
              <span className="font-bold tabular-nums text-foreground">
                {totalOdds.toFixed(2)}
              </span>
            </div>
            <div>
              <label
                htmlFor="stake-input"
                className="mb-1 block text-[11px] uppercase tracking-wide text-muted-foreground"
              >
                {t("stake")}
              </label>
              <Input
                id="stake-input"
                inputMode="decimal"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                placeholder="0.00"
                className="h-9 bg-background/60"
              />
            </div>
            <div className="flex items-center justify-between rounded-md bg-primary/10 px-3 py-2 text-xs">
              <span className="text-muted-foreground">{t("potentialWin")}</span>
              <span className="font-bold tabular-nums text-accent">
                ${potential.toFixed(2)}
              </span>
            </div>
            <Button
              type="button"
              onClick={handlePlace}
              disabled={stakeNum <= 0}
              className="w-full font-semibold"
              style={{ background: "var(--gradient-button)" }}
            >
              {t("placeBet")}
            </Button>
          </div>
        </>
      )}
    </aside>
  );
}
