"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase"; 

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. Listen for the login event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        // 2. Success! Go to the App
        router.replace("/timer");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white space-y-4">
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-zinc-500 text-xs font-medium">Finalizing Login...</p>
    </div>
  );
}