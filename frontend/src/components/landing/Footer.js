import { ADDRESSES } from "@/lib/contracts";

export default function Footer() {
  const mainCA = ADDRESSES.groupSaveFactory;

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

        {/* Network & Verified Contract Badges */}
        <div className="mt-6 pt-6 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-[#bccabf]">
          <div className="flex flex-wrap items-center gap-3">
            <span>© 2026 CowrieChain Labs</span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-[#2BB59A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2BB59A] animate-pulse" />
              All systems operational
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Ethereum Sepolia Testnet Link */}
            <a
              href="https://sepolia.etherscan.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10231d] hover:bg-[#1a382e] border border-white/[0.08] hover:border-[#2BB59A]/40 text-[#F6F1E7] transition-all group"
              title="View Ethereum Sepolia Testnet Network Explorer"
            >
              <span className="w-2 h-2 rounded-full bg-[#E3B04B]" />
              <span className="text-[11px] text-[#bccabf]">Network:</span>
              <span className="text-[11px] font-semibold text-[#E3B04B] group-hover:underline flex items-center gap-0.5">
                Ethereum Sepolia
                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
              </span>
            </a>

            {/* Main Contract Address (CA) Link */}
            <a
              href={`https://sepolia.etherscan.io/address/${mainCA}#code`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10231d] hover:bg-[#1a382e] border border-white/[0.08] hover:border-[#2BB59A]/40 text-[#F6F1E7] transition-all group"
              title="Verify CowrieChain Factory Contract on Sepolia Etherscan"
            >
              <span className="material-symbols-outlined text-[14px] text-[#2BB59A]">verified</span>
              <span className="text-[11px] text-[#bccabf]">Main CA:</span>
              <span className="text-[11px] font-mono text-[#2BB59A] font-semibold group-hover:underline flex items-center gap-0.5">
                {mainCA.slice(0, 6)}...{mainCA.slice(-4)}
                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
