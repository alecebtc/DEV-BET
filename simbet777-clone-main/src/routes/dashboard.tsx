import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider, useLanguage } from "@/hooks/use-language";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { MatchCard } from "@/components/dashboard/MatchCard";
import { BetSlip, type BetSelection } from "@/components/dashboard/BetSlip";
import { DepositDialog } from "@/components/dashboard/DepositDialog";
import { SupportChat } from "@/components/dashboard/SupportChat";
import { liveMatches, upcomingMatches } from "@/lib/mock-matches";
import { Radio, Calendar, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/use-auth-user";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "SimBet777 — Live Sports Betting Dashboard" },
      {
        name: "description",
        content:
          "Place bets on live football, basketball, tennis and more. View real-time odds, scores, and upcoming matches on SimBet777.",
      },
      {
        property: "og:title",
        content: "SimBet777 — Live Sports Betting Dashboard",
      },
      {
        property: "og:description",
        content:
          "Real-time odds across hundreds of leagues. Live streams, instant payouts.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardContent() {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthUser();
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSlipOpen, setMobileSlipOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [profile, setProfile] = useState<{ username: string; balance: number } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/landing" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = () => {
      supabase
        .from("profiles")
        .select("username, balance")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setProfile({ username: data.username, balance: Number(data.balance) });
        });
    };
    load();
    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        load,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handlePick = (matchId: string, pick: "1" | "X" | "2", odd: number) => {
    const all = [...liveMatches, ...upcomingMatches];
    const m = all.find((x) => x.id === matchId);
    if (!m) return;
    setSelections((prev) => {
      const existing = prev.find((s) => s.matchId === matchId);
      const label = `${m.home} vs ${m.away}`;
      if (existing && existing.pick === pick) {
        return prev.filter((s) => s.matchId !== matchId);
      }
      if (existing) {
        return prev.map((s) =>
          s.matchId === matchId ? { ...s, pick, odd } : s,
        );
      }
      return [...prev, { matchId, matchLabel: label, pick, odd }];
    });
  };

  const getActivePick = (matchId: string) =>
    selections.find((s) => s.matchId === matchId)?.pick;

  return (
    <div
      dir={dir}
      className="flex min-h-screen flex-col bg-background text-foreground"
    >
      <DashboardTopBar
        balance={profile?.balance ?? 0}
        username={profile?.username ?? "Guest"}
        onToggleMenu={() => setMobileMenuOpen(true)}
        onDepositClick={() => setDepositOpen(true)}
      />

      {user && (
        <>
          <DepositDialog
            userId={user.id}
            open={depositOpen}
            onClose={() => setDepositOpen(false)}
            onSubmitted={() => setChatOpen(true)}
          />
          <SupportChat userId={user.id} open={chatOpen} onClose={() => setChatOpen(false)} />
        </>
      )}

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <div className="hidden w-64 shrink-0 border-e border-border/40 lg:block">
          <DashboardSidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div
              className={cn(
                "absolute inset-y-0 w-72 max-w-[85vw] bg-background shadow-2xl",
                dir === "rtl" ? "end-0" : "start-0",
              )}
            >
              <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
                <span className="text-sm font-semibold">{t("categories")}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={t("closeMenu")}
                >
                  <X className="size-5" />
                </Button>
              </div>
              <div className="h-[calc(100%-3.25rem)]">
                <DashboardSidebar />
              </div>
            </div>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 overflow-x-hidden p-3 sm:p-4 lg:p-6">
          {/* Hero promo */}
          <div className="mb-4 overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/30 via-primary/15 to-transparent p-4 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
              {t("highlights")}
            </p>
            <h1 className="mt-1 text-xl font-bold leading-tight text-foreground sm:text-2xl">
              Champions League · Quarter Finals
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Boosted odds on every knockout fixture this week
            </p>
          </div>

          {/* Live section */}
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary/20 text-primary">
                <Radio className="size-4" />
              </span>
              <h2 className="text-base font-bold text-foreground sm:text-lg">
                {t("liveNow")}
              </h2>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                {liveMatches.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {liveMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  onPick={handlePick}
                  activePick={getActivePick(m.id)}
                />
              ))}
            </div>
          </section>

          {/* Upcoming section */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-accent/20 text-accent">
                <Calendar className="size-4" />
              </span>
              <h2 className="text-base font-bold text-foreground sm:text-lg">
                {t("upcoming")}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {upcomingMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  onPick={handlePick}
                  activePick={getActivePick(m.id)}
                />
              ))}
            </div>
          </section>
        </main>

        {/* Desktop bet slip */}
        <div className="hidden w-80 shrink-0 border-s border-border/40 p-4 xl:block">
          <div className="sticky top-20">
            <BetSlip
              selections={selections}
              onRemove={(id) =>
                setSelections((prev) => prev.filter((s) => s.matchId !== id))
              }
              onClear={() => setSelections([])}
            />
          </div>
        </div>
      </div>

      {/* Mobile bet slip floating button */}
      {selections.length > 0 && !mobileSlipOpen && (
        <button
          type="button"
          onClick={() => setMobileSlipOpen(true)}
          className="fixed bottom-4 end-4 z-40 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-primary-foreground shadow-2xl xl:hidden"
          style={{ background: "var(--gradient-button)" }}
        >
          {t("betSlip")}
          <span className="rounded-full bg-background/30 px-2 py-0.5 text-xs tabular-nums">
            {selections.length}
          </span>
        </button>
      )}

      {/* Mobile bet slip drawer */}
      {mobileSlipOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSlipOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl bg-background p-4 shadow-2xl">
            <div className="mb-2 flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSlipOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              <BetSlip
                selections={selections}
                onRemove={(id) =>
                  setSelections((prev) => prev.filter((s) => s.matchId !== id))
                }
                onClear={() => setSelections([])}
              />
            </div>
          </div>
        </div>
      )}

      {/* Support chat floating button */}
      {user && !chatOpen && (
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          aria-label="Open support chat"
          className="fixed bottom-4 start-4 z-40 flex h-12 w-12 items-center justify-center rounded-full text-primary-foreground shadow-2xl"
          style={{ background: "var(--gradient-button)" }}
        >
          <MessageSquare className="size-5" />
        </button>
      )}

      <Toaster theme="dark" position="top-center" />
    </div>
  );
}

function DashboardPage() {
  return (
    <LanguageProvider>
      <DashboardContent />
    </LanguageProvider>
  );
}
