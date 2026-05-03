import { useLanguage } from "@/hooks/use-language";
import {
  Radio,
  Trophy,
  Dice5,
  Spade,
  Gamepad2,
  Cpu,
  Medal,
  Gift,
  Ticket,
  Goal,
  Dribbble,
  Disc,
  Snowflake,
  Swords,
  Hand,
  Target,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/i18n";

type CategoryItem = {
  key: TranslationKey;
  icon: LucideIcon;
  count?: number;
  badge?: "live";
};

const mainCategories: CategoryItem[] = [
  { key: "live", icon: Radio, badge: "live", count: 87 },
  { key: "sports", icon: Trophy, count: 1240 },
  { key: "casino", icon: Dice5, count: 512 },
  { key: "liveCasino", icon: Spade, count: 124 },
  { key: "esports", icon: Cpu, count: 38 },
  { key: "virtual", icon: Gamepad2, count: 24 },
  { key: "racing", icon: Medal, count: 16 },
  { key: "promotions", icon: Gift },
  { key: "myBets", icon: Ticket },
];

const topSports: CategoryItem[] = [
  { key: "football", icon: Goal, count: 432 },
  { key: "basketball", icon: Dribbble, count: 187 },
  { key: "tennis", icon: Disc, count: 96 },
  { key: "iceHockey", icon: Snowflake, count: 54 },
  { key: "baseball", icon: Target, count: 42 },
  { key: "mma", icon: Swords, count: 18 },
  { key: "boxing", icon: Hand, count: 12 },
  { key: "cricket", icon: Disc, count: 28 },
];

interface SidebarLinkProps {
  item: CategoryItem;
  active?: boolean;
}

function SidebarLink({ item, active }: SidebarLinkProps) {
  const { t } = useLanguage();
  const Icon = item.icon;
  return (
    <button
      type="button"
      className={cn(
        "group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary/15 text-foreground"
          : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          active ? "text-primary" : "group-hover:text-primary",
        )}
      />
      <span className="flex-1 truncate text-start">{t(item.key)}</span>
      {item.badge === "live" && (
        <span className="flex items-center gap-1 rounded-sm bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          Live
        </span>
      )}
      {typeof item.count === "number" && (
        <span className="text-[11px] font-medium text-muted-foreground/80 tabular-nums">
          {item.count}
        </span>
      )}
    </button>
  );
}

export function DashboardSidebar() {
  const { t } = useLanguage();
  return (
    <aside className="flex h-full w-full flex-col gap-6 overflow-y-auto bg-card/60 p-4 backdrop-blur-md">
      <div>
        <h3 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {t("categories")}
        </h3>
        <nav className="flex flex-col gap-0.5">
          {mainCategories.map((item, idx) => (
            <SidebarLink key={item.key} item={item} active={idx === 0} />
          ))}
        </nav>
      </div>

      <div>
        <h3 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {t("topSports")}
        </h3>
        <nav className="flex flex-col gap-0.5">
          {topSports.map((item) => (
            <SidebarLink key={item.key} item={item} />
          ))}
        </nav>
      </div>

      <div className="mt-auto rounded-lg border border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {t("promotions")}
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">
          +100% Welcome Bonus
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Up to $500 on first deposit
        </p>
      </div>
    </aside>
  );
}
