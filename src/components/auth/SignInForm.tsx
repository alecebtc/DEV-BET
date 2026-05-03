import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Mail, Lock, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { loginSchema } from "@/lib/auth-schemas";

interface Props {
  onSwitchToRegister: () => void;
}

export function SignInForm({ onSwitchToRegister }: Props) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fe: typeof errors = {};
      for (const i of parsed.error.issues) {
        fe[i.path[0] as "email" | "password"] = i.message;
      }
      setErrors(fe);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("invalid login credentials") || msg.includes("invalid")) {
          // Determine if user exists by attempting signup-style check via RPC isn't available;
          // Surface generic + best-effort split:
          toast.error("Wrong email or password.");
        } else if (msg.includes("not found")) {
          toast.error("User not found.");
        } else {
          toast.error(error.message);
        }
        return;
      }
      toast.success("Signed in!");
      navigate({ to: "/dashboard" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-7 backdrop-blur-2xl shadow-2xl sm:p-9"
    >
      <h2 className="mb-6 text-xl font-bold tracking-wide text-white">Welcome back</h2>

      <div className="space-y-4">
        <div>
          <div
            className={`flex items-center gap-3 rounded-md border bg-white/15 px-4 py-3 backdrop-blur-md transition focus-within:bg-white/20 ${
              errors.email ? "border-red-400/70" : "border-white/25 focus-within:border-white/60"
            }`}
          >
            <Mail className="h-5 w-5 text-white/80" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder="Email address"
              autoComplete="email"
              autoFocus
              className="w-full bg-transparent text-base text-white placeholder:text-white/60 focus:outline-none"
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 ps-3 text-xs font-medium text-red-300">{errors.email}</p>
          )}
        </div>

        <div>
          <div
            className={`flex items-center gap-3 rounded-md border bg-white/15 px-4 py-3 backdrop-blur-md transition focus-within:bg-white/20 ${
              errors.password ? "border-red-400/70" : "border-white/25 focus-within:border-white/60"
            }`}
          >
            <Lock className="h-5 w-5 text-white/80" />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((p) => ({ ...p, password: undefined }));
              }}
              placeholder="Password"
              autoComplete="current-password"
              className="w-full bg-transparent text-base text-white placeholder:text-white/60 focus:outline-none"
            />
          </div>
          {errors.password && (
            <p className="mt-1.5 ps-3 text-xs font-medium text-red-300">{errors.password}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-md bg-[image:var(--gradient-button)] px-5 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="h-5 w-5" strokeWidth={2.5} />
            Sign in
          </>
        )}
      </button>

      <p className="mt-5 text-center text-sm text-white/75">
        New here?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-semibold text-white underline-offset-4 hover:underline"
        >
          Create an account
        </button>
      </p>
    </form>
  );
}
