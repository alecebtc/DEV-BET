import { useState, type FormEvent } from "react";
import { User, Lock, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useLanguage } from "@/hooks/use-language";

export function LoginForm() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error(t("missingFields"));
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    toast.success(`${t("welcomeBack")}, ${username}!`);
    navigate({ to: "/dashboard" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-2xl border border-border bg-white/10 p-8 backdrop-blur-xl shadow-[var(--shadow-glass)] sm:p-10"
    >
      <div className="space-y-6">
        <div className="group relative">
          <div className="flex items-center gap-3 border-b-2 border-primary/60 bg-white/85 px-3 py-3 transition-colors focus-within:border-primary">
            <User className="h-5 w-5 text-primary shrink-0" strokeWidth={2.2} />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("loginPlaceholder")}
              autoComplete="username"
              maxLength={50}
              className="w-full bg-transparent text-base text-neutral-800 placeholder:text-neutral-500 focus:outline-none"
              disabled={loading}
            />
          </div>
        </div>

        <div className="group relative">
          <div className="flex items-center gap-3 border-b-2 border-primary/60 bg-white/85 px-3 py-3 transition-colors focus-within:border-primary">
            <Lock className="h-5 w-5 text-primary shrink-0" strokeWidth={2.2} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              autoComplete="current-password"
              maxLength={100}
              className="w-full bg-transparent text-base text-neutral-800 placeholder:text-neutral-500 focus:outline-none"
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center gap-3 rounded-md bg-[image:var(--gradient-button)] px-6 py-4 text-base font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:brightness-110 hover:shadow-[0_0_50px_oklch(0.55_0.22_27/0.5)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{t("signingIn")}</span>
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5" strokeWidth={2.5} />
              <span>{t("signIn")}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
