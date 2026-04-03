/** Duração em minutos → texto curto (pt) */
export function formatLeaderboardDuration(totalMinutes: number): string {
  const m = Math.max(0, Math.floor(totalMinutes));
  const days = Math.floor(m / (60 * 24));
  const h = Math.floor((m % (60 * 24)) / 60);
  const min = m % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (h > 0 || days > 0) parts.push(`${h}h`);
  parts.push(`${min}min`);
  return parts.join(" ");
}

export function formatLeaderboardDiedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-PT", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}
