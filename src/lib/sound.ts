export function playBeep(type: "high" | "low" | "ok" = "ok") {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    const f = type === "high" ? 880 : type === "low" ? 220 : 523.25;
    o.frequency.value = f;
    o.type = "square";
    g.gain.setValueAtTime(0.06, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.15);
  } catch {
    /* no audio */
  }
}
