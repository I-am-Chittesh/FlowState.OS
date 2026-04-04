"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutGrid, Timer, CheckSquare, Settings } from "lucide-react";
import { initPushNotifications } from "../../lib/notifications/pushService";

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize Web Push notifications on app startup
    initPushNotifications().catch((error) => {
      console.warn("⚠️ Failed to initialize push notifications:", error);
    });
  }, []);

  const isLoginPage = pathname === "/login" || pathname === "/callback";

  return (
    <>
      {/* MOBILE LAYOUT: <= md breakpoint */}
      <div className="md:hidden w-screen h-[100dvh] bg-black flex flex-col relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-500/20 via-transparent to-indigo-500/10 blur-3xl animate-pulse opacity-30" />
        </div>

        {/* MAIN CONTENT AREA - Scrollable with page transitions */}
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative z-10 w-full bg-black pb-20"
        >
          {children}
        </motion.main>

        {/* BOTTOM NAVIGATION - Sticky (Mobile only) */}
        {!isLoginPage && (
          <nav className="fixed bottom-0 w-full h-20 bg-gradient-to-t from-black via-zinc-950/80 to-zinc-900/20 backdrop-blur-xl border-t border-emerald-500/20 flex items-center justify-around px-2 z-50">
            <MobileNavButton href="/dashboard" icon={<LayoutGrid size={24} />} label="Dash" isActive={pathname === "/dashboard"} />
            <MobileNavButton href="/timer" icon={<Timer size={24} />} label="Focus" isActive={pathname === "/timer"} />
            <MobileNavButton href="/tasks" icon={<CheckSquare size={24} />} label="Tasks" isActive={pathname === "/tasks"} />
            <MobileNavButton href="/settings" icon={<Settings size={24} />} label="Settings" isActive={pathname === "/settings"} />
          </nav>
        )}
      </div>

      {/* DESKTOP LAYOUT: > md breakpoint */}
      <div className="hidden md:flex w-screen h-screen bg-gradient-to-br from-black via-zinc-950 to-black relative overflow-hidden">
        {/* Animated background ambience with multiple gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top-left emerald glow */}
          <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-emerald-500/15 blur-[120px] rounded-full mix-blend-screen opacity-40 animate-pulse" style={{ animationDuration: '4s' }} />
          
          {/* Bottom-right indigo glow */}
          <div className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-indigo-500/15 blur-[120px] rounded-full mix-blend-screen opacity-30 animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          
          {/* Center cyan accent */}
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full mix-blend-screen opacity-20 animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
          
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        </div>

        {/* LEFT SIDEBAR */}
        {!isLoginPage && (
          <nav className="w-64 bg-gradient-to-b from-zinc-900/50 via-zinc-950/60 to-black backdrop-blur-xl border-r border-emerald-500/10 flex flex-col items-center pt-8 px-4 gap-4 z-50 shadow-2xl">
            {/* Logo/Title with glow */}
            <div className="w-full mb-12 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400 text-center">FlowState</h1>
                <p className="text-center text-xs text-zinc-500 mt-1 font-light tracking-wider">Deep Work</p>
              </div>
            </div>

            {/* Decorative divider */}
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent mb-4" />

            {/* Nav Items */}
            <div className="w-full space-y-3 flex-1">
              <DesktopNavButton 
                href="/dashboard" 
                icon={<LayoutGrid size={20} />} 
                label="Dashboard" 
                isActive={pathname === "/dashboard"} 
              />
              <DesktopNavButton 
                href="/timer" 
                icon={<Timer size={20} />} 
                label="Focus Timer" 
                isActive={pathname === "/timer"} 
              />
              <DesktopNavButton 
                href="/tasks" 
                icon={<CheckSquare size={20} />} 
                label="Tasks" 
                isActive={pathname === "/tasks"} 
              />
              <DesktopNavButton 
                href="/settings" 
                icon={<Settings size={20} />} 
                label="Settings" 
                isActive={pathname === "/settings"} 
              />
            </div>

            {/* Decorative divider */}
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-zinc-700/30 to-transparent mt-8" />

            {/* Footer with stats card */}
            <div className="w-full pt-6 pb-4">
              <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 border border-emerald-500/20 rounded-lg p-3 backdrop-blur-sm">
                <p className="text-center text-xs font-semibold text-emerald-400/80 mb-1">v1.1.0</p>
                <p className="text-center text-[10px] text-zinc-500">JARVIS LABS</p>
              </div>
            </div>
          </nav>
        )}

        {/* MAIN CONTENT AREA - Full width on desktop */}
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth bg-gradient-to-br from-black via-black to-zinc-950 relative z-10">
          {children}
        </main>
      </div>
    </>
  );
}

function MobileNavButton({ href, icon, label, isActive }: { href: string; icon: React.ReactNode; label: string; isActive: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 relative group ${
        isActive 
          ? "text-emerald-400" 
          : "text-zinc-600 hover:text-zinc-300"
      }`}
    >
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 rounded-2xl blur-md opacity-60" />
      )}
      {isActive && (
        <div className="absolute inset-0 bg-emerald-500/15 rounded-2xl border border-emerald-500/30" />
      )}
      
      <div className={`relative z-10 transition-all duration-300 ${isActive ? "scale-110 drop-shadow-lg" : "group-hover:scale-105"}`}>
        {icon}
      </div>
      
      {isActive && <span className="absolute bottom-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400">{label}</span>}
    </Link>
  );
}

function DesktopNavButton({ href, icon, label, isActive }: { href: string; icon: React.ReactNode; label: string; isActive: boolean }) {
  return (
    <Link 
      href={href} 
      className="group relative overflow-hidden"
    >
      <div className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative z-10 ${
        isActive 
          ? "bg-gradient-to-r from-emerald-500/25 to-emerald-500/10 text-emerald-300" 
          : "text-zinc-400 hover:text-zinc-200"
      }`}
      >
        {/* Animated background glow on hover */}
        {!isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-xl" />
        )}

        {/* Icon with glow */}
        <div className={`flex-shrink-0 transition-all duration-300 ${isActive ? "drop-shadow-lg" : "group-hover:drop-shadow-md"}`}>
          {icon}
        </div>

        {/* Label */}
        <span className="text-sm font-semibold text-left flex-grow">{label}</span>

        {/* Active indicator pill */}
        {isActive && (
          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/50 animate-pulse" />
        )}
      </div>

      {/* Border glow effect on active */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl border border-emerald-400/30 opacity-50" />
      )}
    </Link>
  );
}