import { useState, type FormEvent } from "react";
import { Wallet, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  userId: string;
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export function DepositDialog({ userId, open, onClose, onSubmitted }: Props) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("deposit_requests")
      .insert({ user_id: userId, amount: n });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deposit request created");
    setAmount("");
    onSubmitted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute end-3 top-3 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[image:var(--gradient-button)]">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">New Deposit</h2>
            <p className="text-xs text-muted-foreground">Submit a request for review</p>
          </div>
        </div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Amount (USD)
        </label>
        <input
          type="number"
          min="1"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          autoFocus
          disabled={loading}
          className="w-full rounded-md border border-border bg-background/40 px-3 py-2.5 text-base font-semibold text-foreground outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[image:var(--gradient-button)] px-4 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Submitting..." : "Submit Request"}
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Need help? Open the chat after submitting.
        </p>
      </form>
    </div>
  );
}
