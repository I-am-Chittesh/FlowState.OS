"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutGrid, Timer, CheckSquare, Settings } from "lucide-react";
import { supabase } from "../../lib/supabase"; 

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- AUTH LOGIC (Keep existing logic) ---
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') setIsAuthenticated(false);
      else if (session) setIsAuthenticated(true);
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 bg-zinc-900 rounded-2xl animate-pulse flex items-center justify-center border border-zinc-800">
           <div className="w-8 h-8 bg-emerald-500/20 rounded-full animate-ping" />
        </div>
      </div>
    );
  }

  const isLoginPage = pathname === "/login" || pathname === "/callback";

  return (
    // MOBILE-FIRST: Full screen on mobile, centered frame on desktop
    <div className="w-screen h-[100dvh] bg-black flex flex-col md:items-center md:justify-center md:p-4 relative overflow-hidden">
      
      {/* Desktop-only: Subtle background ambience */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full mix-blend-screen opacity-30" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-500/10 blur-[150px] rounded-full mix-blend-screen opacity-20" />
      </div>

      {/* PHONE FRAME: Mobile-first, proper iPhone proportions on desktop */}
      <div className="w-full h-full md:w-[390px] md:h-[844px] md:rounded-[3.5rem] md:border-[12px] md:border-zinc-950 md:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.95),inset_0_1px_3px_rgba(255,255,255,0.1),inset_0_-1px_2px_rgba(0,0,0,0.5)] bg-black relative flex flex-col overflow-hidden z-20">
        
        {/* iPhone Notch Bar (Desktop only) */}
        <div className="hidden md:flex h-7 bg-black/80 backdrop-blur-sm px-6 items-center justify-between text-[11px] text-zinc-500 border-b border-zinc-900/30 relative z-30">
          <span className="text-[10px] font-semibold">FlowState</span>
          <span className="text-[10px] font-mono">9:41</span>
          <div className="flex gap-1 text-[10px]">
            <span>📶</span>
            <span>⚡</span>
          </div>
        </div>

        {/* MAIN CONTENT AREA - Scrollable */}
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative z-10 w-full bg-black">
          {children}
        </main>

        {/* BOTTOM NAVIGATION - Sticky */}
        {!isLoginPage && (
          <nav className="h-20 bg-gradient-to-t from-zinc-950 to-zinc-900/50 backdrop-blur-xl border-t border-zinc-800/50 flex items-center justify-around px-2 shrink-0 z-50 md:rounded-b-[3rem]">
            <NavButton href="/dashboard" icon={<LayoutGrid size={24} />} label="Dash" isActive={pathname === "/dashboard"} />
            <NavButton href="/timer" icon={<Timer size={24} />} label="Focus" isActive={pathname === "/timer"} />
            <NavButton href="/tasks" icon={<CheckSquare size={24} />} label="Tasks" isActive={pathname === "/tasks"} />
            <NavButton href="/settings" icon={<Settings size={24} />} label="Settings" isActive={pathname === "/settings"} />
          </nav>
        )}

      </div>

      {/* Dev Info (Only on desktop) */}
      <div className="hidden md:flex absolute bottom-4 left-4 text-[10px] text-zinc-600 gap-2 pointer-events-none">
        <div className="bg-zinc-900/50 px-2 py-1 rounded">390×844</div>
        <div className="bg-zinc-900/50 px-2 py-1 rounded">Mobile Dev</div>
      </div>
    </div>
  );
}

function NavButton({ href, icon, label, isActive }: { href: string; icon: React.ReactNode; label: string; isActive: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 relative group ${
        isActive ? "text-emerald-400" : "text-zinc-600 hover:text-zinc-300"
      }`}
    >
      {/* Background highlight when active */}
      {isActive && <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl" />}
      
      <div className={`relative z-10 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-105"}`}>
        {icon}
      </div>
      
      {isActive && <span className="absolute bottom-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400">{label}</span>}
    </Link>
  );
}