export default function SlotSkeleton() {
  return (
    <div
      className="flex items-center justify-between border border-white/5 px-4 py-3.5"
      aria-hidden
    >
      <div className="space-y-2">
        <div className="h-4 w-28 animate-shimmer rounded-sm" />
        <div className="h-3 w-20 animate-shimmer rounded-sm opacity-70" />
      </div>
      <div className="h-3 w-14 animate-shimmer rounded-sm opacity-50" />
    </div>
  );
}
