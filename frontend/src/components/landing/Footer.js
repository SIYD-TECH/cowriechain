import Link from "next/link";
import { ADDRESSES } from "@/lib/contracts";

export default function Footer() {
  const mainCA = ADDRESSES.groupSaveFactory;

  const footerNav = [
    {
      title: "Product",
      links: [
        { label: "Goals", href: "/goals" },
        { label: "Circles", href: "/circles" },
        { label: "Reward pool", href: "/rewards" },
      ],
    },
    {
      title: "Developers",
      links: [
        {
          label: "Docs",
          href: "https://github.com/SIYD-TECH/cowriechain#readme",
          external: true,
        },
        {
          label: "GitHub",
          href: "https://github.com/SIYD-TECH/cowriechain",
          external: true,
        },
        {
          label: "Explorer",
          href: "https://sepolia.etherscan.io",
          external: true,
        },
      ],
    },
    {
      title: "Governance",
      links: [
        { label: "Forum", href: "#" },
        { label: "Voting", href: "#" },
        { label: "Treasury", href: "#" },
      ],
    },
  ];

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
          {footerNav.map((col) => (
            <div key={col.title} className="space-y-2">
              <div className="text-[11px] font-semibold tracking-widest uppercase">
                {col.title}
              </div>
              <ul className="space-y-1.5 text-[12px] text-[#bccabf]">
                {col.links.map((x) => (
                  <li key={x.label}>
                    {x.external ? (
                      <a
                        href={x.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white cursor-pointer transition-colors inline-flex items-center gap-1 group"
                      >
                        {x.label}
                        <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">
                          open_in_new
                        </span>
                      </a>
                    ) : (
                      <Link
                        href={x.href}
                        className="hover:text-white cursor-pointer transition-colors"
                      >
                        {x.label}
                      </Link>
                    )}
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

            {/* GitHub Repository Link */}
            <a
              href="https://github.com/SIYD-TECH/cowriechain"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10231d] hover:bg-[#1a382e] border border-white/[0.08] hover:border-[#2BB59A]/40 text-[#F6F1E7] transition-all group"
              title="CowrieChain Open-Source GitHub Repository"
            >
              <svg className="w-3.5 h-3.5 fill-current text-[#bccabf] group-hover:text-white" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span className="text-[11px] text-[#bccabf]">GitHub</span>
              <span className="material-symbols-outlined text-[13px] text-[#bccabf] group-hover:text-white">open_in_new</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
