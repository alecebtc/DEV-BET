import { useEffect, useState } from "react";
import { Check, X, Clock, Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type DepositStatus = "pending" | "approved" | "rejected";

interface DepositRequest {
  id: string;
  user_id: string;
  amount: number;
  status: DepositStatus;
  created_at: string;
  profile?: { username: string; email: string; balance: number } | null;
}

export function DepositRequests() {
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [filter, setFilter] = useState<DepositStatus | "all">("pending");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("deposit_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (!data) return;
    const ids = Array.from(new Set(data.map((d) => d.user_id)));
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, username, email, balance")
      .in("id", ids);
    const profMap = new Map((profs ?? []).map((p) => [p.id, p]));
    setDeposits(
      data.map((d) => ({
        ...(d as DepositRequest),
        profile: (profMap.get(d.user_id) as DepositRequest["profile"]) ?? null,
      })),
    );
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-deposits")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deposit_requests" },
        load,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const updateStatus = async (d: DepositRequest, status: DepositStatus) => {
    setBusyId(d.id);
    const { error } = await supabase
      .from("deposit_requests")
      .update({ status })
      .eq("id", d.id);

    if (!error && status === "approved" && d.profile) {
      const newBal = Number(d.profile.balance) + Number(d.amount);
      await supabase.from("profiles").update({ balance: newBal }).eq("id", d.user_id);
    }
    setBusyId(null);
    if (error) toast.error(error.message);
    else toast.success(`Deposit ${status}`);
    load();
  };

  const filtered = filter === "all" ? deposits : deposits.filter((d) => d.status === filter);
  const pendingCount = deposits.filter((d) => d.status === "pending").length;

  return (
    <div className="rounded-xl border border-border bg-card/60 p-5 backdrop-blur">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">Deposit requests</h3>
          <p className="text-sm text-muted-foreground">
            {pendingCount} pending {pendingCount === 1 ? "request" : "requests"} awaiting approval
          </p>
        </div>
        <div className="flex gap-1 rounded-md border border-border bg-background/30 p-1">
          {(["pending", "approved", "rejected", "all"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded px-3 py-1 text-xs font-medium capitalize transition ${
                filter === s
                  ? "bg-[image:var(--gradient-button)] text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((d) => (
          <div
            key={d.id}
            className="flex flex-col gap-3 rounded-lg border border-border/60 bg-background/30 p-4 lg:flex-row lg:items-center"
          >
            <div className="flex items-center gap-3 lg:w-56">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold text-foreground">
                  {d.profile?.username ?? "Unknown user"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(d.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="lg:flex-1">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Amount</div>
              <div className="font-mono text-lg font-bold text-emerald-400">
                ${Number(d.amount).toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {d.status === "pending" ? (
                <>
                  <button
                    disabled={busyId === d.id}
                    onClick={() => updateStatus(d, "approved")}
                    className="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow transition hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {busyId === d.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Approve & Credit
                  </button>
                  <button
                    disabled={busyId === d.id}
                    onClick={() => updateStatus(d, "rejected")}
                    className="flex items-center gap-1 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-destructive transition hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </>
              ) : (
                <span
                  className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                    d.status === "approved"
                      ? "bg-emerald-600/20 text-emerald-400"
                      : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {d.status === "approved" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {d.status}
                </span>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Clock className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No {filter} deposits</p>
          </div>
        )}
      </div>
    </div>
  );
}
