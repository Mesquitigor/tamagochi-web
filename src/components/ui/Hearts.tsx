export function Hearts({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-16 shrink-0 text-stone-700/80">{label}</span>
      <div className="flex gap-0.5" aria-label={`${label} ${value} de 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={
              i < value ? "text-amber-600 drop-shadow-sm" : "text-stone-300"
            }
          >
            ♥
          </span>
        ))}
      </div>
    </div>
  );
}
