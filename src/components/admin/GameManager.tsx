import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Dices, Spade, Trophy, Tv, Zap, Gamepad2, Crown, Activity } from "lucide-react";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

interface GameCategory {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
}

const initial: GameCategory[] = [
  { id: "casino", name: "Casino", description: "Slots, table games, jackpots", icon: Dices, enabled: true },
  { id: "live-casino", name: "Live Casino", description: "Live dealer blackjack, roulette", icon: Spade, enabled: true },
  { id: "sports", name: "Sportsbook", description: "All sports betting markets", icon: Trophy, enabled: true },
  { id: "live", name: "Live Betting", description: "In-play betting on live matches", icon: Activity, enabled: true },
  { id: "esports", name: "Esports", description: "CS2, Dota 2, LoL betting", icon: Gamepad2, enabled: false },
  { id: "virtual", name: "Virtual Sports", description: "Simulated football, racing", icon: Tv, enabled: true },
  { id: "racing", name: "Horse Racing", description: "Thoroughbred & harness racing", icon: Crown, enabled: false },
  { id: "lottery", name: "Lottery & Instant", description: "Scratch cards, lotto draws", icon: Zap, enabled: true },
];

export function GameManager() {
  const [categories, setCategories] = useState<GameCategory[]>(initial);

  const toggle = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const next = !c.enabled;
        toast.success(`${c.name} ${next ? "enabled" : "disabled"}`);
        return { ...c, enabled: next };
      }),
    );
  };

  const enabledCount = categories.filter((c) => c.enabled).length;

  return (
    <div className="rounded-xl border border-border bg-card/60 p-5 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Betting categories</h3>
          <p className="text-sm text-muted-foreground">
            {enabledCount} of {categories.length} enabled
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.id}
              className={`flex items-center justify-between gap-3 rounded-lg border p-4 transition ${
                c.enabled
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-background/20 opacity-70"
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                    c.enabled ? "bg-[image:var(--gradient-button)] text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-foreground">{c.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{c.description}</div>
                </div>
              </div>
              <Switch checked={c.enabled} onCheckedChange={() => toggle(c.id)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
