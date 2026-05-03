export function BrandLogo() {
  return (
    <div className="flex items-center justify-center select-none">
      <div className="rounded-lg border-2 border-foreground/90 bg-background/40 px-4 py-2 backdrop-blur-sm">
        <span className="font-black text-2xl sm:text-3xl tracking-tight text-foreground">
          SIM
        </span>
        <span className="font-black text-2xl sm:text-3xl tracking-tight text-accent">
          BET
        </span>
        <span className="font-black text-2xl sm:text-3xl tracking-tight text-accent ml-1">
          777
        </span>
      </div>
    </div>
  );
}
