export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-950 to-black">
      {/* NAVBAR */}
      <header className="border-b border-slate-800/60 bg-black/40 backdrop-blur">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-cyan-400 to-violet-500" />
            <span className="text-sm font-semibold tracking-[0.18em] uppercase text-slate-300">
              TradeXray
            </span>
          </div>
          <button className="rounded-full bg-cyan-500 px-4 py-1.5 text-xs font-semibold text-black shadow-lg shadow-cyan-500/30 hover:bg-cyan-400">
            Start Free Demo
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-slate-900/70">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-50 max-w-3xl">
            Institutional‑grade{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
              AI market intelligence
            </span>{" "}
            for traders who can’t afford to guess.
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-relaxed text-slate-300">
            TradeXray fuses neural forecasting, whale analytics, and real‑time
            liquidity mapping into a single forensic‑grade terminal—built for
            funds, desks, and high‑precision traders.
          </p>

          <div className="mt-8 flex gap-4">
            <button className="rounded-full bg-cyan-500 px-6 py-2 text-xs font-semibold text-black shadow-lg shadow-cyan-500/30 hover:bg-cyan-400">
              Start Free Demo
            </button>
            <button className="rounded-full border border-slate-700 px-6 py-2 text-xs font-medium text-slate-100 hover:border-slate-500">
              Request Institutional Access
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-b border-slate-900/70">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-semibold text-slate-50 mb-6">
            One terminal. Every institutional signal that matters.
          </h2>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Neural Engine Forecasting",
                body: "Multi‑layer neural models trained on structure, volatility, and flow.",
              },
              {
                title: "Whale Matrix & Smart Money",
                body: "Track large flows, exchange net‑flows, and cold‑storage rotations.",
              },
              {
                title: "Forensic Liquidity Heatmaps",
                body: "Visualize resting liquidity, absorption, and liquidity voids.",
              },
              {
                title: "Order Flow Intelligence",
                body: "CVD, delta, and microstructure analytics for real aggression.",
              },
              {
                title: "On‑Chain Market Context",
                body: "Active addresses, mempool stress, and exchange flows.",
              },
              {
                title: "Institutional‑grade Reliability",
                body: "99.998% uptime, low‑latency clusters, and hardened infra.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
              >
                <h3 className="text-sm font-semibold text-slate-50">{f.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-semibold text-slate-50">
          Experience Institutional AI Trading Today
        </h2>
        <p className="mt-3 text-slate-400 text-sm">
          Start your free demo and see the market the way smart money does.
        </p>
        <button className="mt-6 rounded-full bg-cyan-500 px-8 py-3 text-sm font-semibold text-black shadow-lg shadow-cyan-500/30 hover:bg-cyan-400">
          Start Free Demo
        </button>
      </section>
    </main>
  );
}
