"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Timer, CheckSquare, Settings } from "lucide-react";

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isLoginPage = pathname === "/login" || pathname === "/callback";

  return (
    <>
      {/* MOBILE LAYOUT: <= md breakpoint */}
      <div className="md:hidden w-screen h-[100dvh] bg-black flex flex-col relative overflow-hidden">
        {/* MAIN CONTENT AREA - Scrollable */}
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative z-10 w-full bg-black pb-20">
          {children}
        </main>

        {/* BOTTOM NAVIGATION - Sticky (Mobile only) */}
        {!isLoginPage && (
          <nav className="fixed bottom-0 w-full h-20 bg-gradient-to-t from-zinc-950 to-zinc-900/50 backdrop-blur-xl border-t border-zinc-800/50 flex items-center justify-around px-2 z-50">
            <MobileNavButton href="/dashboard" icon={<LayoutGrid size={24} />} label="Dash" isActive={pathname === "/dashboard"} />
            <MobileNavButton href="/timer" icon={<Timer size={24} />} label="Focus" isActive={pathname === "/timer"} />
            <MobileNavButton href="/tasks" icon={<CheckSquare size={24} />} label="Tasks" isActive={pathname === "/tasks"} />
            <MobileNavButton href="/settings" icon={<Settings size={24} />} label="Settings" isActive={pathname === "/settings"} />
          </nav>
        )}
      </div>

      {/* DESKTOP LAYOUT: > md breakpoint */}
      <div className="hidden md:flex w-screen h-screen bg-black relative overflow-hidden">
        {/* Background ambience */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full mix-blend-screen opacity-30" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-500/10 blur-[150px] rounded-full mix-blend-screen opacity-20" />
        </div>

        {/* LEFT SIDEBAR */}
        {!isLoginPage && (
          <nav className="w-64 bg-zinc-950/50 backdrop-blur-sm border-r border-zinc-800/50 flex flex-col items-center pt-8 px-4 gap-4 z-50">
            {/* Logo/Title */}
            <div className="w-full mb-8">
              <h1 className="text-xl font-bold text-emerald-400 text-center">FlowState</h1>
            </div>

            {/* Nav Items */}
            <div className="w-full space-y-2 flex-1">
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

            {/* Footer */}
            <div className="w-full pt-8 border-t border-zinc-800/50 text-center text-xs text-zinc-600">
              <p>Deep Work OS</p>
            </div>
          </nav>
        )}

        {/* MAIN CONTENT AREA - Full width on desktop */}
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth bg-black relative z-10">
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
        isActive ? "text-emerald-400" : "text-zinc-600 hover:text-zinc-300"
      }`}
    >
      {isActive && <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl" />}
      <div className={`relative z-10 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-105"}`}>
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
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
        isActive 
          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
          : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
      }`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
      {isActive && <div className="ml-auto w-1.5 h-6 bg-emerald-400 rounded-full" />}
    </Link>
  );
}