const PRESS_LOGOS: Record<string, string> = {
  "Vogue Singapore": "VOGUE",
  "Harper's Bazaar": "BAZAAR",
  "Peak Magazine": "PEAK",
  "Asia Tatler": "TATLER",
  "Honeycombers": "HONEY",
};

interface PressLogosProps {
  names: string[];
}

export default function PressLogos({ names }: PressLogosProps) {
  return (
    <div className="flex w-max animate-marquee items-center gap-16">
      {[...names, ...names].map((name, i) => (
        <span
          key={`${name}-${i}`}
          className="shrink-0 font-display text-lg tracking-[0.2em] text-muted/50 transition-opacity duration-300 hover:text-muted sm:text-xl"
          aria-hidden={i >= names.length}
        >
          {PRESS_LOGOS[name] ?? name}
        </span>
      ))}
    </div>
  );
}

export function PressLogosStatic({ names }: PressLogosProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
      {names.map((name) => (
        <span
          key={name}
          className="font-display text-sm tracking-[0.2em] text-muted/50 sm:text-base"
        >
          {PRESS_LOGOS[name] ?? name}
        </span>
      ))}
    </div>
  );
}
