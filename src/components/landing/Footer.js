export default function Footer() {
  return (
    <footer className="bg-[#01110c] border-t border-white/[0.06]">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-10 pb-6">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-6">
          <div className="col-span-2 lg:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#10231d] flex items-center justify-center text-[#62dd9e]">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C7.58 2 4 5.58 4 10c0 4.97 3.5 10.3 7.2 11.75.52.2 1.08.2 1.6 0C16.5 20.3 20 14.97 20 10c0-4.42-3.58-8-8-8zm0 15c-1.66 0-3-2.69-3-6s1.34-6 3-6 3 2.69 3 6-1.34 6-3 6z" />
                </svg>
              </div>
              <span className="sora text-[15px] font-semibold">
                Cowrie<span className="text-[#62dd9e]">Chain</span>
              </span>
            </div>
            <p className="text-[12px] text-[#bccabf] leading-5 max-w-sm">
              Sovereign communal wealth — non-custodial rotating credit and
              automated savings pools.
            </p>
          </div>
          {[
            { h: "Product", l: ["Goals", "Circles", "Reward pool"] },
            { h: "Developers", l: ["Docs", "GitHub", "Explorer"] },
            { h: "Governance", l: ["Forum", "Voting", "Treasury"] },
          ].map((col) => (
            <div key={col.h} className="space-y-2">
              <div className="text-[11px] font-semibold tracking-widest uppercase">
                {col.h}
              </div>
              <ul className="space-y-1.5 text-[12px] text-[#bccabf]">
                {col.l.map((x) => (
                  <li
                    key={x}
                    className="hover:text-white cursor-pointer transition-colors"
                  >
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 p-4 rounded-xl bg-[#10231d] border border-white/[0.06] flex gap-2.5 text-[11px] text-[#bccabf] leading-5">
          <span className="material-symbols-outlined text-[#e4c279] text-[16px] shrink-0">
            warning
          </span>
          <span>
            <strong className="text-white">Risk disclosure:</strong> Smart
            contracts are programmatic and subject to network mechanics. Review
            before depositing.
          </span>
        </div>
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-[#bccabf]">
          <span>© 2025 CowrieChain Labs</span>
          <span className="flex gap-4">
            <span>All systems operational</span>
            <span className="mono">Block 19,402,184</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
