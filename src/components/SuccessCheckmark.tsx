export default function SuccessCheckmark() {
  return (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold/40 bg-gold-soft">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden
        className="text-gold"
      >
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        <path
          d="M10 16 L14 20 L22 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-check-draw"
        />
      </svg>
    </div>
  );
}
