"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function RootPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Register service worker for PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.log("SW registration failed:", err);
      });
    }

    // Check for existing session
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
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