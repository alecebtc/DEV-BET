import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LANG_STORAGE_KEY,
  getDir,
  translations,
  type Language,
  type TranslationKey,
} from "@/lib/i18n";

type LanguageContextValue = {
  lang: Language;
  dir: "ltr" | "rtl";
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  // Hydrate from localStorage on client
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY) as Language | null;
    if (stored === "en" || stored === "he") {
      setLangState(stored);
    }
  }, []);

  // Sync <html dir> and <html lang>
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = getDir(lang);
  }, [lang]);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[lang][key],
    [lang],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, dir: getDir(lang), setLang, t }),
    [lang, setLang, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
