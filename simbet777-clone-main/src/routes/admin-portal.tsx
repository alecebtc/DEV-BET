import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, LogOut, Trophy, ToggleLeft, Wallet, ArrowLeft, Users, MessageSquare } from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { MatchManager } from "@/components/admin/MatchManager";
import { GameManager } from "@/components/admin/GameManager";
import { DepositRequests } from "@/components/admin/DepositRequests";
import { UsersManager } from "@/components/admin/UsersManager";
import { AdminChat } from "@/components/admin/AdminChat";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin-portal")({
  head: () => ({
    meta: [
      { title: "Admin Portal — SimBet777" },
      { name: "description", content: "Internal administration dashboard for SimBet777." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPortalPage,
});

function AdminPortalPage() {
  return (
    <AdminAuthProvider>
      <AdminPortalShell />
      <Toaster theme="dark" position="top-center" />
    </AdminAuthProvider>
  );
}

function AdminPortalShell() {
  const { isAuthenticated, loading } = useAdminAuth();
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  if (!isAuthenticated) return <AdminLogin />;
  return <AdminDashboard />;
}

type Tab = "users" | "deposits" | "chat" | "matches" | "games";

const tabs: { id: Tab; label: string; icon: typeof Trophy }[] = [
  { id: "users", label: "Users", icon: Users },
  { id: "deposits", label: "Deposits", icon: Wallet },
  { id: "chat", label: "Support Chat", icon: MessageSquare },
  { id: "matches", label: "Match Manager", icon: Trophy },
  { id: "games", label: "Game Manager", icon: ToggleLeft },
];

function AdminDashboard() {
  const { logout } = useAdminAuth();
  const [tab, setTab] = useState<Tab>("users");

  return (
    <div className="min-h-screen bg-background">
      {/* Inline styles for shared admin inputs */}
      <style>{`
        .admin-input {
          width: 100%;
          background-color: oklch(0.18 0.08 25 / 0.5);
          border: 1px solid var(--border);
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: var(--foreground);
          outline: none;
          transition: border-color .15s;
        }
        .admin-input:focus { border-color: var(--primary); }
        .admin-input::placeholder { color: var(--muted-foreground); }
      `}</style>

      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[image:var(--gradient-button)] shadow-[var(--shadow-glow)]">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground sm:text-lg">SimBet777 Admin</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">Operations control center</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 rounded-md border border-border bg-background/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to site</span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-[image:var(--gradient-button)] text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {tab === "users" && <UsersManager />}
        {tab === "deposits" && <DepositRequests />}
        {tab === "chat" && <AdminChat />}
        {tab === "matches" && <MatchManager />}
        {tab === "games" && <GameManager />}
      </main>
    </div>
  );
}
