import { useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2, Save, X, Trophy } from "lucide-react";
import { toast } from "sonner";

interface AdminMatch {
  id: string;
  league: string;
  teamA: string;
  teamB: string;
  oddsHome: number;
  oddsDraw: number;
  oddsAway: number;
  startTime: string;
}

const initialMatches: AdminMatch[] = [
  { id: "m1", league: "Premier League", teamA: "Arsenal", teamB: "Chelsea", oddsHome: 1.85, oddsDraw: 3.4, oddsAway: 4.2, startTime: "2026-04-22T20:45" },
  { id: "m2", league: "La Liga", teamA: "Real Madrid", teamB: "Barcelona", oddsHome: 2.1, oddsDraw: 3.2, oddsAway: 3.1, startTime: "2026-04-23T21:00" },
  { id: "m3", league: "Champions League", teamA: "Bayern", teamB: "PSG", oddsHome: 1.95, oddsDraw: 3.6, oddsAway: 3.8, startTime: "2026-04-24T20:00" },
];

const emptyForm: Omit<AdminMatch, "id"> = {
  league: "",
  teamA: "",
  teamB: "",
  oddsHome: 2.0,
  oddsDraw: 3.2,
  oddsAway: 3.0,
  startTime: "",
};

export function MatchManager() {
  const [matches, setMatches] = useState<AdminMatch[]>(initialMatches);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<AdminMatch, "id">>(emptyForm);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.teamA.trim() || !form.teamB.trim() || !form.league.trim() || !form.startTime) {
      toast.error("Please fill all match fields");
      return;
    }
    if (editingId) {
      setMatches((prev) => prev.map((m) => (m.id === editingId ? { ...m, ...form } : m)));
      toast.success("Match updated");
    } else {
      setMatches((prev) => [{ id: `m${Date.now()}`, ...form }, ...prev]);
      toast.success("Match added");
    }
    resetForm();
  };

  const handleEdit = (m: AdminMatch) => {
    setEditingId(m.id);
    const { id, ...rest } = m;
    void id;
    setForm(rest);
  };

  const handleDelete = (id: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== id));
    if (editingId === id) resetForm();
    toast.success("Match removed");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-card/60 p-5 backdrop-blur"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold text-foreground">
            <Trophy className="h-4 w-4 text-accent" />
            {editingId ? "Edit match" : "Add new match"}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="space-y-3">
          <Field label="League">
            <input
              value={form.league}
              onChange={(e) => setForm({ ...form, league: e.target.value })}
              placeholder="e.g. Premier League"
              className="admin-input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Team A (Home)">
              <input
                value={form.teamA}
                onChange={(e) => setForm({ ...form, teamA: e.target.value })}
                className="admin-input"
              />
            </Field>
            <Field label="Team B (Away)">
              <input
                value={form.teamB}
                onChange={(e) => setForm({ ...form, teamB: e.target.value })}
                className="admin-input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Field label="Odds 1">
              <input
                type="number"
                step="0.01"
                min="1"
                value={form.oddsHome}
                onChange={(e) => setForm({ ...form, oddsHome: Number(e.target.value) })}
                className="admin-input"
              />
            </Field>
            <Field label="Odds X">
              <input
                type="number"
                step="0.01"
                min="1"
                value={form.oddsDraw}
                onChange={(e) => setForm({ ...form, oddsDraw: Number(e.target.value) })}
                className="admin-input"
              />
            </Field>
            <Field label="Odds 2">
              <input
                type="number"
                step="0.01"
                min="1"
                value={form.oddsAway}
                onChange={(e) => setForm({ ...form, oddsAway: Number(e.target.value) })}
                className="admin-input"
              />
            </Field>
          </div>

          <Field label="Start time">
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="admin-input"
            />
          </Field>

          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[image:var(--gradient-button)] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
          >
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? "Save changes" : "Add match"}
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-border bg-card/60 p-5 backdrop-blur">
        <h3 className="mb-4 font-semibold text-foreground">All matches ({matches.length})</h3>
        <div className="space-y-2">
          {matches.map((m) => (
            <div
              key={m.id}
              className="flex flex-col gap-3 rounded-lg border border-border/60 bg-background/30 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{m.league}</div>
                <div className="truncate font-semibold text-foreground">
                  {m.teamA} <span className="text-muted-foreground">vs</span> {m.teamB}
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  <span className="rounded bg-primary/15 px-2 py-0.5 text-primary">1: {m.oddsHome.toFixed(2)}</span>
                  <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground">X: {m.oddsDraw.toFixed(2)}</span>
                  <span className="rounded bg-primary/15 px-2 py-0.5 text-primary">2: {m.oddsAway.toFixed(2)}</span>
                  <span className="text-muted-foreground">· {new Date(m.startTime).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(m)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background/40 text-foreground hover:bg-accent hover:text-accent-foreground"
                  aria-label="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {matches.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No matches yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
