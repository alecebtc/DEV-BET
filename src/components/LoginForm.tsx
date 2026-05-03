import { useState, type FormEvent } from "react";
import { User, Lock, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, Link } from "@tanstack/react-router";
import { useLanguage } from "@/hooks/use-language";
import { supabase } from "@/integrations/supabase/client";

export function LoginForm() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password.trim()) {
      toast.error(t("missingFields"));
      return;
    }
    setLoading(true);
    
    try {
      // Check if input is email or username
      const isEmail = usernameOrEmail.includes("@");
      let email = usernameOrEmail;
      
      if (!isEmail) {
        // Look up email by username
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("email")
          .eq("username", usernameOrEmail.toLowerCase())
          .maybeSingle();
        
        if (profileError || !profile) {
          toast.error("User not found");
          setLoading(false);
          return;
        }
        email = profile.email;
      }
      
      // Attempt sign in with email
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          toast.error("Wrong password");
        } else if (error.message.toLowerCase().includes("not found")) {
          toast.error("User not found");
        } else {
          toast.error(error.message);
        }
        setLoading(false);
        return;
      }
      
      toast.success(`${t("welcomeBack")}!`);
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("An error occurred. Please try again.");
      setLoading(false);
    }
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
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder={t("loginPlaceholder")}
              autoComplete="username"
              maxLength={100}
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

        <p className="text-center text-sm text-white/75">
          {"Don't have an account? "}
          <Link
            to="/landing"
            className="font-semibold text-white underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </form>
  );
}
