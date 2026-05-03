import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  User,
  Mail,
  Phone,
  Lock,
  AtSign,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  registerSchema,
  usernameRegex,
  type RegisterValues,
} from "@/lib/auth-schemas";

const STEPS = [
  { id: 1, label: "Your name" },
  { id: 2, label: "Contact" },
  { id: 3, label: "Account" },
] as const;

interface Props {
  onSwitchToLogin: () => void;
}

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export function RegisterForm({ onSwitchToLogin }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<RegisterValues>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterValues, string>>>({});
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  const set = <K extends keyof RegisterValues>(k: K, v: RegisterValues[K]) => {
    setValues((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  // Real-time username availability check (debounced)
  useEffect(() => {
    const u = values.username.trim();
    if (!u) {
      setUsernameStatus("idle");
      return;
    }
    if (!usernameRegex.test(u)) {
      setUsernameStatus("invalid");
      return;
    }
    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.rpc("is_username_available", {
        check_username: u,
      });
      if (error) {
        setUsernameStatus("idle");
        return;
      }
      setUsernameStatus(data ? "available" : "taken");
    }, 400);
    return () => clearTimeout(timer);
  }, [values.username]);

  const validateStep = (): boolean => {
    const partial =
      step === 1
        ? registerSchema.pick({ firstName: true, lastName: true })
        : step === 2
          ? registerSchema.pick({ phone: true, email: true })
          : registerSchema.pick({ username: true, password: true });
    const result = partial.safeParse(values);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of result.error.issues) {
        const k = issue.path[0] as keyof RegisterValues;
        fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      return false;
    }
    if (step === 3 && usernameStatus !== "available") {
      setErrors((p) => ({ ...p, username: "Pick an available username" }));
      return false;
    }
    return true;
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(3, s + 1));
  };
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: { username: values.username },
        },
      });
      if (error) {
        if (error.message.toLowerCase().includes("already")) {
          toast.error("An account with this email already exists.");
        } else {
          toast.error(error.message);
        }
        return;
      }
      const userId = data.user?.id;
      if (userId) {
        const { error: profileErr } = await supabase.from("profiles").insert({
          id: userId,
          username: values.username,
          first_name: values.firstName,
          last_name: values.lastName,
          phone: values.phone,
          email: values.email,
        });
        if (profileErr) {
          if (profileErr.code === "23505") {
            toast.error("Username just got taken — pick another.");
            setStep(3);
            setUsernameStatus("taken");
            return;
          }
          toast.error(profileErr.message);
          return;
        }
      }
      toast.success("Account created! Welcome.");
      navigate({ to: "/dashboard" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-7 backdrop-blur-2xl shadow-2xl sm:p-9"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-wide text-white">Create account</h2>
        <span className="text-xs font-medium text-white/70">
          Step {step} of {STEPS.length}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-7 flex gap-2">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              s.id <= step ? "bg-primary shadow-[0_0_10px_oklch(0.55_0.22_27/0.7)]" : "bg-white/20"
            }`}
          />
        ))}
      </div>

      <div className="space-y-4">
        {step === 1 && (
          <>
            <Field
              icon={<User className="h-5 w-5" />}
              placeholder="First name"
              value={values.firstName}
              onChange={(v) => set("firstName", v)}
              error={errors.firstName}
              autoFocus
            />
            <Field
              icon={<User className="h-5 w-5" />}
              placeholder="Last name"
              value={values.lastName}
              onChange={(v) => set("lastName", v)}
              error={errors.lastName}
            />
          </>
        )}

        {step === 2 && (
          <>
            <Field
              icon={<Phone className="h-5 w-5" />}
              type="tel"
              placeholder="Phone number"
              value={values.phone}
              onChange={(v) => set("phone", v)}
              error={errors.phone}
              autoFocus
            />
            <Field
              icon={<Mail className="h-5 w-5" />}
              type="email"
              placeholder="Email address"
              value={values.email}
              onChange={(v) => set("email", v)}
              error={errors.email}
            />
          </>
        )}

        {step === 3 && (
          <>
            <Field
              icon={<AtSign className="h-5 w-5" />}
              placeholder="Username"
              value={values.username}
              onChange={(v) => set("username", v.replace(/\s/g, ""))}
              error={errors.username}
              autoFocus
              rightAdornment={<UsernameStatusIndicator status={usernameStatus} />}
            />
            {!errors.username && usernameStatus === "available" && (
              <p className="-mt-2 ps-3 text-xs font-medium text-emerald-300">
                Username is available
              </p>
            )}
            {!errors.username && usernameStatus === "taken" && (
              <p className="-mt-2 ps-3 text-xs font-medium text-red-300">
                That username is already taken
              </p>
            )}
            {!errors.username && usernameStatus === "invalid" && (
              <p className="-mt-2 ps-3 text-xs font-medium text-amber-300">
                3–20 chars · letters, numbers, _
              </p>
            )}
            <Field
              icon={<Lock className="h-5 w-5" />}
              type="password"
              placeholder="Password (min 8 chars)"
              value={values.password}
              onChange={(v) => set("password", v)}
              error={errors.password}
            />
          </>
        )}
      </div>

      <div className="mt-7 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={back}
            disabled={submitting}
            className="flex h-12 items-center justify-center gap-2 rounded-md border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            type="button"
            onClick={next}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[image:var(--gradient-button)] px-5 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={submitting || usernameStatus !== "available"}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[image:var(--gradient-button)] px-5 text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>

      <p className="mt-5 text-center text-sm text-white/75">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-white underline-offset-4 hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

function UsernameStatusIndicator({ status }: { status: UsernameStatus }) {
  if (status === "checking")
    return <Loader2 className="h-5 w-5 animate-spin text-white/70" />;
  if (status === "available")
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/90">
        <Check className="h-4 w-4 text-white" strokeWidth={3} />
      </span>
    );
  if (status === "taken" || status === "invalid")
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/90">
        <X className="h-4 w-4 text-white" strokeWidth={3} />
      </span>
    );
  return null;
}

interface FieldProps {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoFocus?: boolean;
  rightAdornment?: React.ReactNode;
}

function Field({
  icon,
  placeholder,
  value,
  onChange,
  error,
  type = "text",
  autoFocus,
  rightAdornment,
}: FieldProps) {
  return (
    <div>
      <div
        className={`flex items-center gap-3 rounded-md border bg-white/15 px-4 py-3 backdrop-blur-md transition focus-within:bg-white/20 ${
          error
            ? "border-red-400/70"
            : "border-white/25 focus-within:border-white/60"
        }`}
      >
        <span className="text-white/80">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-transparent text-base text-white placeholder:text-white/60 focus:outline-none"
        />
        {rightAdornment}
      </div>
      {error && <p className="mt-1.5 ps-3 text-xs font-medium text-red-300">{error}</p>}
    </div>
  );
}
