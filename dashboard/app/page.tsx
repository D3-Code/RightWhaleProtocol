// app/page.tsx
"use client";

import { ActivityLog } from "@/components/ActivityLog";
import { Allocations } from "@/components/Allocations";
import { ProtocolInfo } from "@/components/ProtocolInfo";
import { motion } from "framer-motion";
import { PulseIndicator } from "@/components/PulseIndicator";
import { WalletChecker } from "@/components/WalletChecker";
import { GlobalStats } from "@/components/GlobalStats";
import { Wallet, Globe, Terminal, Activity, Zap, BarChart3, Droplets, Send, Bot, Github } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-black bg-grid-pattern p-4 md:p-6 text-zinc-100 font-mono-tech selection:bg-orange-500/30 relative">

      {/* Floating HUD Status - Top Right */}
      <div className="fixed flex items-center gap-2 z-[100]" style={{ top: '2rem', right: '2rem' }}>
        <div className="glass-panel px-3 py-1.5 rounded-full border border-emerald-500/20 bg-black/80 backdrop-blur-md flex items-center gap-3 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <div className="text-emerald-500 font-bold text-xs flex items-center gap-2">
            SYSTEM ONLINE <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="mb-6">
          <header className="glass-panel relative flex flex-col md:flex-row items-center justify-between rounded-none border-l-4 border-l-orange-500 p-6 gap-6 md:gap-0">

            {/* Left: Brand */}
            <div className="flex items-center gap-4 z-20 w-full md:w-auto justify-between md:justify-start">
              <div className="flex flex-col">
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white">
                  RIGHTWHALE
                  <span className="text-orange-500">PROTOCOL</span>
                </h1>
                <div className="flex items-center">
                  <div className="h-1 w-8 bg-orange-500 mr-2 animate-pulse"></div>
                  <p className="text-zinc-500 uppercase tracking-widest border-r border-zinc-800 pr-4 mr-2 text-xs md:text-sm">
                    Autonomous Liquidity Engine v1.0
                  </p>
                </div>
              </div>
              {/* Mobile Status Indicator (Visible only on mobile) */}
              <div className="md:hidden">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
              </div>
            </div>

            {/* Center: Logo & Socials (Relative on Mobile, Absolute on Desktop) */}
            <div className="relative md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-10 flex flex-col items-center gap-3 mt-4 md:mt-0">
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-orange-500/50 shadow-[0_0_25px_rgba(255,107,0,0.3)] group bg-black">
                <div className="absolute inset-0 group-hover:bg-transparent transition-colors z-10"></div>
                <Image
                  src="/logo.jpg"
                  alt="RightWhale Logo"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
            </div>

            {/* Right: Status (Removed - Moved to Absolute Top Right) */}
            <div className="hidden md:flex w-24"></div>
          </header>
        </div>

        {/* Global Protocol Stats */}
        <GlobalStats />

        {/* 2. Main Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-3">

            {/* Protocol Schematic */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="glass-panel p-6 relative overflow-hidden group rounded-xl"
            >
              <h2 className="text-sm text-zinc-500 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-2 flex justify-between items-center">
                <span className="flex items-center gap-2"><Terminal className="w-4 h-4 text-orange-500" /> SCHEMATIC // ENGINE FLOW</span>

              </h2>
              <ProtocolInfo />
            </motion.div>

            {/* Resource Allocation - Moved Here */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="glass-panel p-6 relative rounded-xl"
            >
              <h2 className="text-sm text-zinc-500 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-2 flex justify-between items-center">
                <span className="flex items-center gap-2"><Droplets className="w-4 h-4 text-blue-500" /> RESOURCE ALLOCATION</span>

              </h2>
              <Allocations />
            </motion.div>

            {/* Wallet Checker - Moved Here */}
            {/* Community Uplink (Socials) - Moved Here */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="glass-panel p-6 flex flex-col gap-4 rounded-xl"
            >

              <div className="grid grid-cols-2 gap-3">
                <a href="https://t.me/RightWhaleBotChannel" target="_blank" className="bg-[#229ED9]/10 hover:bg-[#229ED9] border border-[#229ED9]/50 hover:border-[#229ED9] text-[#229ED9] hover:text-white py-3 rounded transition-all flex items-center justify-center gap-2 group">
                  <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-wider">Channel</span>
                </a>
                <a href="https://t.me/RightWhaleBot" target="_blank" className="bg-[#2AABEE]/10 hover:bg-[#2AABEE] border border-[#2AABEE]/50 hover:border-[#2AABEE] text-[#2AABEE] hover:text-white py-3 rounded transition-all flex items-center justify-center gap-2 group">
                  <Bot className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-wider">Start Bot</span>
                </a>
              </div>
            </motion.div>

            {/* Community Uplink (Socials) - Moved Here */}
            {/* Wallet Checker - Moved Here */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="glass-panel p-0 rounded-xl overflow-hidden"
            >
              <WalletChecker />
            </motion.div>

            {/* Terminal Activity Log */}
            <motion.div
              className="glass-panel p-0 overflow-hidden flex flex-col h-[500px] rounded-xl"
            >
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-zinc-400 font-mono-tech uppercase tracking-widest">Console Output</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
                </div>
              </div>
              <div className="flex-1 overflow-hidden relative">
                <ActivityLog />
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">





            <div className="p-4 rounded border border-zinc-800 bg-zinc-900/20 text-center">
              <p className="text-xs text-zinc-600">
                RightWhale Protocol &copy; 2026 <br />
                <span className="opacity-50">System ID: RW V1.0</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
