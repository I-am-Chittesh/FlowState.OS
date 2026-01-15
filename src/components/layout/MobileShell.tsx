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

  if (isLoading) return <div className="h-screen bg-black" />; 

  // --- RENDER HELPERS ---
  const isLoginPage = pathname === "/login" || pathname === "/callback";

  return (
    // 1. THE OUTER SHELL (Handles the Desktop "Aurora" Background)
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      
      {/* Desktop Background Ambience (Hidden on Mobile) */}
      <div className="hidden md:block absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-500/10 blur-[150px] rounded-full mix-blend-screen opacity-40 animate-pulse" />
      <div className="hidden md:block absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-500/10 blur-[150px] rounded-full mix-blend-screen opacity-30" />

      {/* 2. THE SMART CONTAINER (The "Phone Frame") */}
      {/* On Mobile: w-full h-full (Full Screen) */}
      {/* On Desktop: w-[450px] h-[850px] (Centered App Window) */}
      <div className="w-full h-[100dvh] md:h-[85vh] md:w-[420px] md:max-w-md md:rounded-[3rem] md:border-[8px] md:border-zinc-900 md:shadow-2xl bg-black relative flex flex-col overflow-hidden">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative z-10">
          {children}
        </main>

        {/* Bottom Navigation Dock (Hidden on Login) */}
        {!isLoginPage && (
          <nav className="h-20 bg-zinc-900/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 shrink-0 z-50 pb-safe md:rounded-b-[2.5rem]">
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