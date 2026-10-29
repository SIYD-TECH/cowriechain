"use client";
import Link from "next/link";
import {
  motion,
  useSpring,
  useMotionValue,
  useTransform,
  useScroll,
} from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useAccount } from "wagmi";

function CountUp({ to, active, decimals = 0 }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 88, damping: 18 });
  const rounded = useTransform(spring, (v) =>
    decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-US"),
  );
  const [d, setD] = useState("0");
  useEffect(() => {
    const u = rounded.on("change", (v) => setD(String(v)));
    return () => u();
  }, [rounded]);
  useEffect(() => {
    if (active) mv.set(to);
  }, [active, to, mv]);
  return <>{d}</>;
}

const word = {
  hidden: { opacity: 0, y: 18, clipPath: "inset(0 0 100% 0)" },
  show: {
    opacity: 1,
    y: 0,
    clipPath: "inset(0 0 0% 0)",
    transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
  },
};
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.14 } },
};

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const glowX = useTransform(scrollYProgress, [0, 1], ["-50%", "-44%"]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.2]);
  const [inView, setInView] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const t = setTimeout(() => setInView(true), 80);
    return () => clearTimeout(t);
  }, []);
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({
      x: ((e.clientX - r.left) / r.width - 0.5) * 5,
      y: ((e.clientY - r.top) / r.height - 0.5) * -5,
    });
  };
  const onLeave = () => setTilt({ x: 0, y: 0 });

  const { isConnected } = useAccount();


  return (
    <section
      ref={ref}
      className="relative overflow-hidden px-4 lg:px-8 pt-8 lg:pt-10 pb-12"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ y: bgY }}
      >
        <motion.div
          className="absolute top-6 left-1/2 w-[900px] h-[480px] bg-[#62dd9e]/[0.07] rounded-full blur-[120px]"
          style={{ x: glowX, opacity: glowOpacity }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -top-10 right-0 w-[520px] h-[520px] bg-[#e4c279]/[0.05] rounded-full blur-[110px]"
          style={{ opacity: glowOpacity }}
          animate={{ scale: [1, 1.08, 1], x: [0, 10, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[58%] left-[8%] w-[420px] h-[260px] bg-[#62dd9e]/[0.04] rounded-full blur-[90px]"
          animate={{ x: [0, 18, 0], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[42%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#62dd9e]/[0.08] to-transparent"
          animate={{ x: ["-8%", "8%", "-8%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[62%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e4c279]/[0.06] to-transparent"
          animate={{ x: ["8%", "-8%", "8%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.045]"
        fill="none"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M-120,460 C280,120 520,790 920,460 C1210,200 1410,620 1620,460"
          stroke="#62dd9e"
          strokeWidth="1.2"
          pathLength={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
        <motion.path
          d="M-120,530 C300,220 540,860 940,530 C1220,300 1420,690 1640,530"
          stroke="#e4c279"
          strokeWidth="0.7"
          pathLength={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.9, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
        />
        <ellipse
          cx="720"
          cy="430"
          rx="355"
          ry="168"
          stroke="#62dd9e"
          strokeWidth="0.6"
          opacity="0.45"
        />
        <ellipse
          cx="720"
          cy="430"
          rx="245"
          ry="108"
          stroke="#e4c279"
          strokeWidth="0.5"
          opacity="0.32"
        />
        <motion.circle
          r="3.2"
          fill="#62dd9e"
          opacity="0.85"
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
          style={{
            offsetPath: `path("M-120,460 C280,120 520,790 920,460 C1210,200 1410,620 1620,460")`,
          }}
        />
        <motion.circle
          r="2.3"
          fill="#e4c279"
          opacity="0.65"
          initial={{ offsetDistance: "48%" }}
          animate={{ offsetDistance: "148%" }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          style={{
            offsetPath: `path("M-120,530 C300,220 540,860 940,530 C1220,300 1420,690 1640,530")`,
          }}
        />
      </svg>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[6%] top-[18%] opacity-[0.035]"
        animate={{ y: [0, -10, 0], rotate: [0, 1.5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="88" height="56" viewBox="0 0 88 56" fill="none">
          <ellipse
            cx="44"
            cy="28"
            rx="38"
            ry="22"
            stroke="#62dd9e"
            strokeWidth="1.1"
          />
          <ellipse
            cx="44"
            cy="28"
            rx="22"
            ry="12"
            stroke="#62dd9e"
            strokeWidth="0.7"
          />
          <path
            d="M44 8 L44 48"
            stroke="#62dd9e"
            strokeWidth="0.6"
            strokeDasharray="3 3"
          />
        </svg>
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-[7%] top-[52%] opacity-[0.03]"
        animate={{ y: [0, 8, 0], rotate: [0, -1.2, 0] }}
        transition={{
          duration: 8.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.2,
        }}
      >
        <svg width="72" height="46" viewBox="0 0 72 46" fill="none">
          <ellipse
            cx="36"
            cy="23"
            rx="30"
            ry="17"
            stroke="#e4c279"
            strokeWidth="1"
          />
          <ellipse
            cx="36"
            cy="23"
            rx="17"
            ry="9"
            stroke="#e4c279"
            strokeWidth="0.6"
          />
        </svg>
      </motion.div>

      <div className="relative max-w-[1440px] mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1b2e27] border border-white/[0.06] text-[#e4c279] text-[11px] font-semibold tracking-widest uppercase shadow-sm"
        >
          <span className="relative flex w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-[#e4c279] animate-ping opacity-40" />
            <span className="relative w-2 h-2 rounded-full bg-[#e4c279]" />
          </span>
          Protocol v1.0 · Decentralized savings
          <span className="hidden sm:inline-flex ml-1 px-1.5 py-0.5 rounded bg-[#e4c279]/15 text-[#e4c279] text-[9px] tracking-widest">
            LIVE ON SEPOLIA
          </span>
        </motion.div>

        <motion.h1
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="sora max-w-[760px] leading-[0.98] tracking-[-0.035em] text-[38px] sm:text-[48px] lg:text-[60px] font-bold mt-6"
        >
          <motion.span variants={word} className="inline-block overflow-hidden">
            <span className="inline-block">Build better</span>
          </motion.span>{" "}
          <motion.span variants={word} className="inline-block overflow-hidden">
            <span className="inline-block">saving habits.</span>
          </motion.span>{" "}
          <motion.span variants={word} className="inline-block relative">
            <span className="inline-block text-[#62dd9e]">Together.</span>
            <motion.span
              className="absolute -bottom-1 left-0 h-[3px] bg-gradient-to-r from-[#62dd9e] to-[#e4c279] rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: inView ? 1 : 0 }}
              transition={{
                duration: 0.55,
                delay: 0.62,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ width: "100%", transformOrigin: "left" }}
            />
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.42 }}
          className="text-[16px] lg:text-[17px] leading-7 text-[#bccabf] max-w-[560px] mt-4"
        >
          Turn goals into enforceable plans and communities into sovereign
          wealth — on-chain, non-custodial, no middlemen.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-3 mt-7 w-full sm:w-auto"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href={isConnected ? "/dashboard" : "/auth"}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#1aa56c] hover:bg-[#62dd9e] text-white hover:text-[#002111] sora text-[15px] font-semibold rounded-xl shadow-[0_8px_24px_rgba(26,165,108,.28)] transition-colors"
            >
              {isConnected ? "Go to dashboard" : "Start saving"}
              <motion.span
                className="material-symbols-outlined text-[18px]"
                animate={{ x: [0, 3, 0] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 0.6,
                }}
              >
                arrow_forward
              </motion.span>
            </Link>
          </motion.div>
          <a
            href="#circles"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#10231d] hover:bg-[#1b2e27] text-white sora text-[15px] font-semibold rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-colors"
          >
            <span className="material-symbols-outlined text-[#62dd9e] text-[18px] group-hover:rotate-6 transition-transform">
              group_work
            </span>{" "}
            Explore circles
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#bccabf]"
        >
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#62dd9e]" />{" "}
            Non-custodial
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e4c279]" /> Auditable
            on Sepolia
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#62dd9e]" />{" "}
            Collateral-enforced
          </span>
        </motion.div>

        <div
          className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch mt-10"
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, rotate: -1.2 }}
            animate={{ opacity: 1, y: 0, rotate: -1.2, y: [0, -6, 0] }}
            transition={{
              duration: 0.5,
              delay: 0.58,
              y: {
                duration: 4.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.7,
              },
            }}
            whileHover={{ rotate: 0, y: -6 }}
            style={{
              rotateX: tilt.y * 0.6,
              rotateY: tilt.x * 0.6,
              transformStyle: "preserve-3d",
            }}
            className="lg:col-span-3 order-2 lg:order-1 bg-[#10231d] p-5 rounded-2xl shadow-xl text-left border border-white/[0.06] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#62dd9e]/[0.04] to-transparent pointer-events-none" />
            <div className="relative flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full bg-[#1b2e27] text-[#62dd9e] text-[10px] font-semibold tracking-widest uppercase">
                Personal vault
              </span>
              <span className="material-symbols-outlined text-[#e4c279] text-[18px]">
                lock_clock
              </span>
            </div>
            <div className="relative sora text-[15px] font-semibold">
              Lagos workspace
            </div>
            <div className="relative text-[12px] text-[#bccabf]">
              Target · Dec 15
            </div>
            <div className="relative mt-3 flex justify-between text-[11px] font-medium">
              <span className="text-[#bccabf]">Saved</span>
              <span className="text-[#62dd9e] tabular-nums">
                <CountUp to={70.8} active={inView} decimals={1} />% · $8,500 /
                $12,000
              </span>
            </div>
            <div className="relative mt-1.5 w-full h-1.5 rounded-full bg-[#01110c] overflow-hidden">
              <motion.div
                className="h-full bg-[#62dd9e] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: inView ? "70.8%" : 0 }}
                transition={{
                  duration: 1,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.85,
                }}
              />
            </div>
            <div className="relative mt-3 flex items-center gap-1.5 text-[10px] text-[#bccabf]">
              <span className="w-1 h-1 rounded-full bg-[#62dd9e]" /> Bi-weekly ·
              $250
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.58,
              delay: 0.62,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              rotateX: tilt.y,
              rotateY: tilt.x,
              transformStyle: "preserve-3d",
            }}
            className="lg:col-span-6 order-1 lg:order-2 bg-[#1b2e27] p-6 rounded-2xl shadow-2xl relative overflow-hidden text-left border border-white/[0.06]"
          >
            <motion.div
              aria-hidden
              className="absolute -top-20 -right-20 w-56 h-56 bg-[#62dd9e]/[0.14] rounded-full blur-2xl"
              animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.85, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="text-[10px] font-semibold tracking-widest uppercase text-[#e4c279]">
                  Active vault
                </div>
                <div className="sora text-[17px] font-semibold">
                  Consolidated balance
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10231d] border border-[#e4c279]/20 text-[#e4c279] text-[10px] font-semibold tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e4c279] animate-pulse" />{" "}
                Timelock enforced
              </span>
            </div>
            <div className="relative sora text-[40px] lg:text-[46px] font-bold tracking-tight mt-3 leading-none tabular-nums">
              $<CountUp to={12450} active={inView} />
              <span className="text-[15px] font-normal text-[#bccabf]">
                .00 cUSD
              </span>
            </div>
            <div className="relative text-[12px] text-[#bccabf] mt-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#62dd9e] text-[14px]">
                verified_user
              </span>{" "}
              Next release · Nov 01 · Vault #0x71e…88b2
            </div>
            <div className="relative grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#01110c] mt-4 border border-white/[0.04]">
              <div className="flex items-center gap-3">
                <svg
                  className="w-12 h-12 -rotate-90 shrink-0"
                  viewBox="0 0 48 48"
                >
                  <circle
                    cx="24"
                    cy="24"
                    r="18"
                    fill="none"
                    stroke="rgba(255,255,255,.08)"
                    strokeWidth="4"
                  />
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="18"
                    fill="none"
                    stroke="#62dd9e"
                    strokeWidth="4"
                    strokeLinecap="round"
                    pathLength={1}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 0.68 }}
                    transition={{
                      duration: 1.05,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.9,
                    }}
                  />
                </svg>
                <div>
                  <div className="sora text-[15px] font-semibold tabular-nums">
                    <CountUp to={68} active={inView} />%
                  </div>
                  <div className="text-[10px] tracking-widest uppercase text-[#bccabf]">
                    Portfolio target
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center text-right sm:text-left">
                <span className="text-[10px] tracking-widest uppercase text-[#bccabf]">
                  Next auto-contribution
                </span>
                <motion.span
                  className="sora text-[14px] font-semibold text-[#e4c279]"
                  animate={{ opacity: [1, 0.85, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  3d : 14h : 22m
                </motion.span>
              </div>
            </div>
            <motion.div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -skew-x-12"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{
                duration: 1.1,
                delay: 1.4,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16, rotate: 1.1 }}
            animate={{ opacity: 1, y: 0, rotate: 1.1, y: [0, -5, 0] }}
            transition={{
              duration: 0.5,
              delay: 0.68,
              y: {
                duration: 4.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              },
            }}
            whileHover={{ rotate: 0, y: -6 }}
            style={{
              rotateX: tilt.y * 0.6,
              rotateY: tilt.x * 0.6,
              transformStyle: "preserve-3d",
            }}
            className="lg:col-span-3 order-3 bg-[#10231d] p-5 rounded-2xl shadow-xl text-left border border-white/[0.06] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-bl from-[#e4c279]/[0.05] to-transparent pointer-events-none" />
            <div className="relative flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full bg-[#e4c279]/15 text-[#e4c279] text-[10px] font-semibold tracking-widest uppercase">
                Rotational circle
              </span>
              <motion.span
                className="material-symbols-outlined text-[#63dca2] text-[18px]"
                animate={{ rotate: [0, 12, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                published_with_changes
              </motion.span>
            </div>
            <div className="relative sora text-[15px] font-semibold">
              Nairobi Builders #4
            </div>
            <div className="relative text-[12px] text-[#bccabf]">
              Cycle 3 of 6
            </div>
            <div className="relative mt-3 p-3 rounded-xl bg-[#01110c] space-y-1.5 text-[11px] border border-white/[0.04]">
              <div className="flex justify-between">
                <span className="text-[#bccabf]">Pooled pot</span>
                <span className="text-[#e4c279] font-semibold">
                  $9,000 cUSD
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#bccabf]">Turn</span>
                <span className="font-semibold">Kwame M.</span>
              </div>
            </div>
            <div className="relative mt-2 w-full h-1.5 rounded-full bg-[#01110c] overflow-hidden">
              <motion.div
                className="h-full bg-[#e4c279] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "50%" }}
                transition={{
                  duration: 0.9,
                  delay: 1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </div>
            <div className="relative mt-2 text-[10px] text-[#bccabf] flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#e4c279]" /> 5 days to
              next payout
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
