import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { BrandLogo } from "@/components/BrandLogo";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { SignInForm } from "@/components/auth/SignInForm";
const heroBg = "/images/hero-sports.jpg";

export const Route = createFileRoute("/landing")({
  head: () => ({
    meta: [
      { title: "SimBet777 — Join the action" },
      {
        name: "description",
        content:
          "Create your SimBet777 account or sign in to bet on football, basketball, tennis and more.",
      },
      { property: "og:title", content: "SimBet777 — Join the action" },
      {
        property: "og:description",
        content: "Premium sports betting. Create your account in seconds.",
      },
      { property: "og:image", content: heroBg },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const [mode, setMode] = useState<"register" | "login">("register");

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <img
        src={heroBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Dark overlay for readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.15 0.05 25 / 0.55) 0%, oklch(0.12 0.06 25 / 0.75) 60%, oklch(0.08 0.05 25 / 0.9) 100%)",
        }}
      />

      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="mb-6 sm:mb-8">
          <BrandLogo />
        </div>

        <h1 className="mb-2 text-center text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {mode === "register" ? "Join the action" : "Sign in to play"}
        </h1>
        <p className="mb-7 max-w-md text-center text-sm text-white/80 sm:text-base">
          Football, basketball, tennis & more — odds updated in real time.
        </p>

        {mode === "register" ? (
          <RegisterForm onSwitchToLogin={() => setMode("login")} />
        ) : (
          <SignInForm onSwitchToRegister={() => setMode("register")} />
        )}

        <p className="mt-6 text-center text-xs text-white/60 sm:text-sm">
          Bet responsibly · 18+ only
        </p>
      </section>

      <Toaster theme="dark" position="top-center" />
    </main>
  );
}
