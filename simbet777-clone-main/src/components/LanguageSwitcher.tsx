import { Languages } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import type { Language } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();

  const buttons: { code: Language; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "he", label: "עב" },
  ];

  return (
    <div
      role="group"
      aria-label={t("languageLabel")}
      className="inline-flex items-center gap-1 rounded-full border border-border bg-background/50 p-1 backdrop-blur-md shadow-[var(--shadow-glass)]"
    >
      <Languages
        className="h-4 w-4 text-foreground/70 mx-2"
        aria-hidden="true"
      />
      {buttons.map((b) => {
        const active = lang === b.code;
        return (
          <button
            key={b.code}
            type="button"
            onClick={() => setLang(b.code)}
            aria-pressed={active}
            className={`rounded-full px-3 py-1 text-xs font-bold tracking-wider transition-all ${
              active
                ? "bg-[image:var(--gradient-button)] text-primary-foreground shadow-[var(--shadow-glow)]"
                : "text-foreground/70 hover:text-foreground hover:bg-white/5"
            }`}
          >
            {b.label}
          </button>
        );
      })}
    </div>
  );
}
