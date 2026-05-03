import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { LoginForm } from "@/components/LoginForm";
import { BrandLogo } from "@/components/BrandLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LanguageProvider, useLanguage } from "@/hooks/use-language";
import heroBg from "@/assets/hero-sports.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SimBet777 — Sign In" },
      {
        name: "description",
        content:
          "Sign in to SimBet777, your premium sports betting destination for football, basketball, tennis and more.",
      },
      { property: "og:title", content: "SimBet777 — Sign In" },
      {
        property: "og:description",
        content: "Premium sports betting platform. Sign in to your account.",
      },
    ],
  }),
  component: Index,
});

function IndexContent() {
  const { t, dir } = useLanguage();

  return (
    <main dir={dir} className="relative min-h-screen w-full overflow-hidden">
      {/* Hero background */}
      <img
        src={heroBg}
        alt=""
        aria-hidden="true"
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Overlay gradient */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="absolute inset-0 bg-background/30" />

      {/* Language switcher */}
      <div className="absolute top-4 right-4 z-20 sm:top-6 sm:right-6">
        <LanguageSwitcher />
      </div>

      {/* Content */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="mb-8 sm:mb-10">
          <BrandLogo />
        </div>

        <h1 className="sr-only">{t("signInTitle")}</h1>

        <LoginForm />

        <p className="mt-8 text-center text-xs text-muted-foreground/80 sm:text-sm">
          {t("betResponsibly")}
        </p>
      </section>

      <Toaster theme="dark" position="top-center" />
    </main>
  );
}

function Index() {
  return (
    <LanguageProvider>
      <IndexContent />
    </LanguageProvider>
  );
}
