"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase"; 

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // 1. Immediate Check: Did the session already land?
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("Session found immediately, redirecting...");
        router.replace("/timer");
        return;
      }

      // 2. Event Listener: Catch the login as it happens
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log("Auth Event Detected:", event);
        if (session || event === "SIGNED_IN") {
          router.replace("/timer");
        }
      });

      // 3. Fail-Safe: Don't hang forever
      const timeout = setTimeout(() => {
        console.log("Auth timed out, returning to login.");
        router.replace("/login");
      }, 10000); // 10 seconds

      return () => {
        subscription.unsubscribe();
        clearTimeout(timeout);
      };
    };

    handleAuth();
  }, [router]);

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white space-y-6">
      {/* Sleek Minimalist Spinner */}
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-zinc-800 rounded-full" />
        <div className="absolute w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
      
      <div className="text-center space-y-1">
        <p className="text-white text-sm font-medium tracking-tight">Syncing FlowState ID</p>
        <p className="text-zinc-500 text-[10px] uppercase tracking-widest animate-pulse">Establishing Secure Session</p>
      </div>
    </div>
  );
}