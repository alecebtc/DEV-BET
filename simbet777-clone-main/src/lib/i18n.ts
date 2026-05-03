export type Language = "en" | "he";

export type TranslationKey =
  | "signInTitle"
  | "signInDescription"
  | "loginPlaceholder"
  | "passwordPlaceholder"
  | "signIn"
  | "signingIn"
  | "welcomeBack"
  | "missingFields"
  | "betResponsibly"
  | "languageLabel"
  | "english"
  | "hebrew"
  // Dashboard
  | "balance"
  | "deposit"
  | "profile"
  | "logout"
  | "search"
  | "searchPlaceholder"
  | "categories"
  | "live"
  | "sports"
  | "casino"
  | "liveCasino"
  | "esports"
  | "virtual"
  | "racing"
  | "promotions"
  | "myBets"
  | "topSports"
  | "football"
  | "basketball"
  | "tennis"
  | "iceHockey"
  | "baseball"
  | "mma"
  | "boxing"
  | "cricket"
  | "liveNow"
  | "upcoming"
  | "popularToday"
  | "highlights"
  | "match"
  | "time"
  | "addToSlip"
  | "betSlip"
  | "emptyBetSlip"
  | "stake"
  | "potentialWin"
  | "placeBet"
  | "home"
  | "draw"
  | "away"
  | "minute"
  | "openMenu"
  | "closeMenu";

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    signInTitle: "SimBet777 — Sign In",
    signInDescription:
      "Sign in to SimBet777, your premium sports betting destination for football, basketball, tennis and more.",
    loginPlaceholder: "Login",
    passwordPlaceholder: "Password",
    signIn: "Sign In",
    signingIn: "Signing in...",
    welcomeBack: "Welcome back",
    missingFields: "Please enter both username and password",
    betResponsibly: "Bet responsibly · 18+ only",
    languageLabel: "Language",
    english: "English",
    hebrew: "עברית",
    balance: "Balance",
    deposit: "Deposit",
    profile: "Profile",
    logout: "Logout",
    search: "Search",
    searchPlaceholder: "Search teams, leagues, events...",
    categories: "Categories",
    live: "Live",
    sports: "Sports",
    casino: "Casino",
    liveCasino: "Live Casino",
    esports: "Esports",
    virtual: "Virtual Sports",
    racing: "Horse Racing",
    promotions: "Promotions",
    myBets: "My Bets",
    topSports: "Top Sports",
    football: "Football",
    basketball: "Basketball",
    tennis: "Tennis",
    iceHockey: "Ice Hockey",
    baseball: "Baseball",
    mma: "MMA",
    boxing: "Boxing",
    cricket: "Cricket",
    liveNow: "Live Now",
    upcoming: "Upcoming Matches",
    popularToday: "Popular Today",
    highlights: "Highlights",
    match: "Match",
    time: "Time",
    addToSlip: "Add to bet slip",
    betSlip: "Bet Slip",
    emptyBetSlip: "Your bet slip is empty. Click on odds to add selections.",
    stake: "Stake",
    potentialWin: "Potential Win",
    placeBet: "Place Bet",
    home: "1",
    draw: "X",
    away: "2",
    minute: "'",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  he: {
    signInTitle: "SimBet777 — התחברות",
    signInDescription:
      "התחבר ל-SimBet777, יעד הימורי הספורט המוביל שלך לכדורגל, כדורסל, טניס ועוד.",
    loginPlaceholder: "שם משתמש",
    passwordPlaceholder: "סיסמה",
    signIn: "התחבר",
    signingIn: "מתחבר...",
    welcomeBack: "ברוך שובך",
    missingFields: "נא להזין שם משתמש וסיסמה",
    betResponsibly: "הימור אחראי · גיל 18+ בלבד",
    languageLabel: "שפה",
    english: "English",
    hebrew: "עברית",
    balance: "יתרה",
    deposit: "הפקדה",
    profile: "פרופיל",
    logout: "התנתק",
    search: "חיפוש",
    searchPlaceholder: "חפש קבוצות, ליגות, אירועים...",
    categories: "קטגוריות",
    live: "לייב",
    sports: "ספורט",
    casino: "קזינו",
    liveCasino: "קזינו חי",
    esports: "ספורט אלקטרוני",
    virtual: "ספורט וירטואלי",
    racing: "מרוצי סוסים",
    promotions: "מבצעים",
    myBets: "ההימורים שלי",
    topSports: "ספורט מוביל",
    football: "כדורגל",
    basketball: "כדורסל",
    tennis: "טניס",
    iceHockey: "הוקי קרח",
    baseball: "בייסבול",
    mma: "MMA",
    boxing: "איגרוף",
    cricket: "קריקט",
    liveNow: "משחקים חיים",
    upcoming: "משחקים קרובים",
    popularToday: "פופולרי היום",
    highlights: "מומלצים",
    match: "משחק",
    time: "זמן",
    addToSlip: "הוסף לטופס הימור",
    betSlip: "טופס הימור",
    emptyBetSlip: "טופס ההימור ריק. לחץ על יחס כדי להוסיף הימור.",
    stake: "סכום הימור",
    potentialWin: "זכייה אפשרית",
    placeBet: "בצע הימור",
    home: "1",
    draw: "X",
    away: "2",
    minute: "'",
    openMenu: "פתח תפריט",
    closeMenu: "סגור תפריט",
  },
};

export const LANG_STORAGE_KEY = "simbet777-lang";

export function getDir(lang: Language): "ltr" | "rtl" {
  return lang === "he" ? "rtl" : "ltr";
}
