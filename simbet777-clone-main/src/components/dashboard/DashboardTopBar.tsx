import { Bell, Menu, Search, User, Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/hooks/use-language";

interface DashboardTopBarProps {
  balance: number;
  username: string;
  onToggleMenu: () => void;
  onDepositClick?: () => void;
}

export function DashboardTopBar({
  balance,
  username,
  onToggleMenu,
  onDepositClick,
}: DashboardTopBarProps) {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/40 bg-background/85 px-3 backdrop-blur-md sm:h-16 sm:gap-3 sm:px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onToggleMenu}
        aria-label={t("openMenu")}
      >
        <Menu className="size-5" />
      </Button>

      <div className="flex shrink-0 items-center">
        <div className="scale-75 sm:scale-90">
          <BrandLogo />
        </div>
      </div>

      <div className="relative ms-2 hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t("searchPlaceholder")}
          className="h-9 ps-9 bg-card/50 border-border/60"
        />
      </div>

      <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
        <div className="hidden items-center gap-2 rounded-md border border-border/50 bg-card/50 px-3 py-1.5 sm:flex">
          <Wallet className="size-4 text-accent" />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {t("balance")}
            </span>
            <span className="text-sm font-semibold tabular-nums text-foreground">
              ${balance.toFixed(2)}
            </span>
          </div>
        </div>

        <Button
          size="sm"
          onClick={onDepositClick}
          className="h-9 gap-1 px-2.5 text-xs font-semibold sm:px-3 sm:text-sm"
          style={{ background: "var(--gradient-button)" }}
        >
          <Plus className="size-3.5 sm:size-4" />
          <span>{t("deposit")}</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:inline-flex"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
        </Button>

        <LanguageSwitcher />

        <button
          type="button"
          className="flex items-center gap-2 rounded-md border border-border/50 bg-card/50 px-2 py-1.5 transition-colors hover:bg-card/80"
          aria-label={t("profile")}
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-primary/20 text-primary">
            <User className="size-4" />
          </span>
          <span className="hidden text-sm font-semibold text-foreground md:inline">
            {username}
          </span>
        </button>
      </div>
    </header>
  );
}
