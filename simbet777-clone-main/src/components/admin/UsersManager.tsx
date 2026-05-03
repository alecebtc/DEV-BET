import { useEffect, useState } from "react";
import { User as UserIcon, Save, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  balance: number;
  created_at: string;
}

export function UsersManager() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      return;
    }
    setUsers((data ?? []) as Profile[]);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (u: Profile) => {
    const raw = edits[u.id];
    if (raw === undefined) return;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) {
      toast.error("Enter a valid balance");
      return;
    }
    setSavingId(u.id);
    const { error } = await supabase.from("profiles").update({ balance: n }).eq("id", u.id);
    setSavingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Balance updated for ${u.username}`);
    setEdits((p) => {
      const c = { ...p };
      delete c[u.id];
      return c;
    });
    load();
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(q)
    );
  });

  return (
    <div className="rounded-xl border border-border bg-card/60 p-5 backdrop-blur">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-foreground">All users</h3>
          <p className="text-sm text-muted-foreground">{users.length} registered users</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-64 rounded-md border border-border bg-background/40 py-2 ps-9 pe-3 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((u) => (
          <div
            key={u.id}
            className="flex flex-col gap-3 rounded-lg border border-border/60 bg-background/30 p-4 lg:flex-row lg:items-center"
          >
            <div className="flex items-center gap-3 lg:w-64">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                <UserIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold text-foreground">{u.username}</div>
                <div className="truncate text-xs text-muted-foreground">{u.email}</div>
              </div>
            </div>

            <div className="lg:w-48">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Name</div>
              <div className="text-sm text-foreground">
                {u.first_name} {u.last_name}
              </div>
            </div>

            <div className="lg:w-40">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Balance</div>
              <div className="font-mono font-bold text-emerald-400">
                ${Number(u.balance).toFixed(2)}
              </div>
            </div>

            <div className="flex flex-1 items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Set balance"
                value={edits[u.id] ?? ""}
                onChange={(e) => setEdits((p) => ({ ...p, [u.id]: e.target.value }))}
                className="admin-input flex-1"
              />
              <button
                onClick={() => save(u)}
                disabled={savingId === u.id || edits[u.id] === undefined}
                className="flex items-center gap-1 rounded-md bg-[image:var(--gradient-button)] px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground disabled:opacity-50"
              >
                {savingId === u.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">No users found</div>
        )}
      </div>
    </div>
  );
}
