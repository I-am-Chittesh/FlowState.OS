"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  // Show loading screen while checking auth
  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-zinc-900 rounded-2xl animate-pulse flex items-center justify-center border border-zinc-800">
        <div className="w-8 h-8 bg-emerald-500/20 rounded-full animate-ping" />
      </div>
    </div>
  );
}