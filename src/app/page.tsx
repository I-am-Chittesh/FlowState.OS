"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check for existing session first
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
        return;
      }
    };

    // Check initial session
    checkInitialSession();

    // Then listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          router.push("/dashboard");
        } else if (event === "SIGNED_OUT") {
          router.push("/login");
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  // Show loading screen while checking auth
  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center space-y-6">
      {/* White Square Logo */}
      <div className="w-24 h-24 bg-white rounded-2xl shadow-2xl animate-in fade-in duration-700" />
      
      {/* App Name */}
      <h1 className="text-white text-3xl font-bold tracking-tighter">FlowState.OS</h1>
      
      {/* Loading indicator */}
      <div className="flex gap-2 items-center">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
      </div>
    </div>
  );
}