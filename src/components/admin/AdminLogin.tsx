import { useState, type FormEvent } from "react";
import { ShieldCheck, Lock, Mail, LogIn } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export function AdminLogin() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) toast.error(res.error ?? "Invalid admin credentials");
    else toast.success("Welcome, Administrator");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-border bg-card/80 p-8 shadow-[var(--shadow-glass)] backdrop-blur-xl"
      >
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[image:var(--gradient-button)] shadow-[var(--shadow-glow)]">
            <ShieldCheck className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Portal</h1>
          <p className="text-sm text-muted-foreground">Restricted access — administrators only</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-md border border-border bg-background/40 px-3 py-2.5 focus-within:border-primary">
            <Mail className="h-4 w-4 text-primary shrink-0" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email"
              autoComplete="email"
              maxLength={120}
              disabled={loading}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 rounded-md border border-border bg-background/40 px-3 py-2.5 focus-within:border-primary">
            <Lock className="h-4 w-4 text-primary shrink-0" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              maxLength={100}
              disabled={loading}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[image:var(--gradient-button)] px-4 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Verifying..." : "Sign In"}
          </button>

          <p className="pt-2 text-center text-xs text-muted-foreground">
            Sign in with an account that has the admin role.
          </p>
        </div>
      </form>
    </div>
  );
}
