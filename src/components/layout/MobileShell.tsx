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

  // ... inside MobileShell component ...

  // REPLACE the old "if (isLoading)" block with this smoother version:
  if (isLoading) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center z-50">
        {/* A smooth breathing logo animation */}
        <div className="w-16 h-16 bg-zinc-900 rounded-2xl animate-pulse flex items-center justify-center border border-zinc-800">
           <div className="w-8 h-8 bg-emerald-500/20 rounded-full animate-ping" />
        </div>
      </div>
    );
  }

  // ... rest of the code ...

  // --- RENDER HELPERS ---
  const isLoginPage = pathname === "/login" || pathname === "/callback";

  return (
    // 1. THE OUTER SHELL (Full-screen dark background with glow effects)
    <div className="min-h-screen w-screen bg-black flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      
      {/* Desktop-only: Ambient glow effects */}
      <div className="hidden lg:block absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-500/15 blur-[120px] rounded-full mix-blend-screen opacity-50" />
      <div className="hidden lg:block absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/15 blur-[120px] rounded-full mix-blend-screen opacity-40" />

      {/* 2. MOBILE FRAME - The "Device" Container */}
      <div className="w-full h-[100dvh] md:w-[420px] md:h-[844px] md:rounded-[2.5rem] md:border-8 md:border-zinc-800 md:shadow-[0_0_60px_rgba(0,0,0,0.9),inset_0_0_20px_rgba(255,255,255,0.05)] bg-black relative flex flex-col overflow-hidden z-10">
        
        {/* Notch/Status Bar (Desktop only) */}
        <div className="hidden md:flex h-8 bg-black px-6 items-center justify-between text-[10px] text-zinc-500 border-b border-zinc-900/50 relative z-20">
          <span>FlowState</span>
          <span className="absolute left-1/2 -translate-x-1/2">9:41</span>
          <span>⚡︎</span>
        </div>

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative z-10 w-full">
          {children}
        </main>

        {/* Bottom Navigation Dock (Hidden on Login) */}
        {!isLoginPage && (
          <nav className="h-20 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/50 flex items-center justify-around px-2 shrink-0 z-50 md:pb-4">
            <NavButton href="/dashboard" icon={<LayoutGrid size={24} />} label="Dash" isActive={pathname === "/dashboard"} />
            <NavButton href="/timer" icon={<Timer size={24} />} label="Focus" isActive={pathname === "/timer"} />
            <NavButton href="/tasks" icon={<CheckSquare size={24} />} label="Tasks" isActive={pathname === "/tasks"} />
            <NavButton href="/settings" icon={<Settings size={24} />} label="Settings" isActive={pathname === "/settings"} />
          </nav>
        )}

      </div>
    </div>
  );
}

function NavButton({ href, icon, label, isActive }: { href: string; icon: React.ReactNode; label: string; isActive: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 ${
        isActive ? "text-emerald-400 bg-white/5 scale-105" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
      }`}
    >
      <div className={`mb-1 transition-transform duration-300 ${isActive ? "-translate-y-0.5" : ""}`}>{icon}</div>
      <span className={`text-[10px] font-medium tracking-wide ${isActive ? "opacity-100" : "opacity-0 scale-0"} transition-all duration-300`}>{label}</span>
    </Link>
  );
}