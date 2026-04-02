export default function PlayLoading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[#fff5f9] px-4">
      <div className="h-16 w-16 animate-pulse rounded-full bg-pink-200" />
      <p className="text-sm text-pink-800/70">A carregar o teu tamagotchi…</p>
    </div>
  );
}
