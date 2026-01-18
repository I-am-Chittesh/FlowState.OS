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
        // Check if this is a new Google sign-in and create/update profile
        await ensureProfileExists(session);
        router.replace("/dashboard");
        return;
      }

      // 2. Event Listener: Catch the login as it happens
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth Event Detected:", event);
        if (session || event === "SIGNED_IN") {
          if (session) {
            await ensureProfileExists(session);
          }
          router.replace("/dashboard");
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

    const ensureProfileExists = async (session: any) => {
      if (!session.user) return;

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      // If profile doesn't exist (new user), create it
      if (!existingProfile) {
        const fullName = session.user.user_metadata?.full_name || session.user.email || "User";
        await supabase.from('profiles').insert({
          id: session.user.id,
          full_name: fullName,
          xp: 0,
          level: 1,
          total_time: 0,
          sessions_completed: 0
        });
      }
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