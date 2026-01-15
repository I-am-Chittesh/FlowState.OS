"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Lock, Sparkles, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase"; 

export default function LoginPage() {
  const router = useRouter();
  
  // State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const springTransition = {
    type: "spring" as const, 
    stiffness: 400,
    damping: 30
  };

  // ... inside LoginPage component ...

  const handleGoogleLogin = async () => {
    // 1. DYNAMIC URL DETECTION
    // This automatically grabs "http://localhost:3000" OR "https://your-app.vercel.app"
    // depending on where you are currently running the code.
    const SITE_URL = window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${SITE_URL}/callback`, // <--- Uses the current location
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });
    if (error) setErrorMsg(error.message);
  };

  // --- EMAIL/PASSWORD LOGIC ---
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/timer");
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center relative overflow-hidden selection:bg-emerald-500/30">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full mix-blend-screen opacity-50 animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen opacity-30" />

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
        className="w-full max-w-md mt-32 px-6 z-10"
      >
        
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-full px-3 py-1 mb-4"
          >
            <Sparkles size={12} className="text-emerald-400" />
            <span className="text-[10px] font-medium text-zinc-400 tracking-wide uppercase">FlowState ID</span>
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-zinc-500 text-sm">
            {isSignUp ? "Join the focused 1%." : "Enter your zone."}
          </p>
        </div>

        {/* The Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          
          <div className="relative group">
            <motion.div 
              animate={focusedField === "email" ? { scale: 1.02 } : { scale: 1 }}
              transition={springTransition}
              className={`relative flex items-center bg-zinc-900/50 border ${focusedField === "email" ? "border-emerald-500/50 ring-2 ring-emerald-500/10" : "border-zinc-800"} rounded-2xl p-4 transition-colors duration-300`}
            >
              <Mail size={20} className={`mr-3 ${focusedField === "email" ? "text-emerald-400" : "text-zinc-500"} transition-colors`} />
              <input 
                type="email" 
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                className="bg-transparent w-full outline-none text-sm placeholder:text-zinc-600 text-white"
              />
            </motion.div>
          </div>

          <div className="relative group">
            <motion.div 
              animate={focusedField === "password" ? { scale: 1.02 } : { scale: 1 }}
              transition={springTransition}
              className={`relative flex items-center bg-zinc-900/50 border ${focusedField === "password" ? "border-emerald-500/50 ring-2 ring-emerald-500/10" : "border-zinc-800"} rounded-2xl p-4 transition-colors duration-300`}
            >
              <Lock size={20} className={`mr-3 ${focusedField === "password" ? "text-emerald-400" : "text-zinc-500"} transition-colors`} />
              <input 
                type="password" 
                required
                minLength={6}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                className="bg-transparent w-full outline-none text-sm placeholder:text-zinc-600 text-white"
              />
            </motion.div>
          </div>

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-400 text-xs px-2"
            >
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={springTransition}
            disabled={isLoading}
            className="w-full bg-white text-black font-semibold rounded-2xl p-4 flex items-center justify-center gap-2 mt-6 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-zinc-300 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        {/* Toggle Sign Up / Sign In */}
        <div className="text-center mt-4">
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(null); }}
            className="text-zinc-500 text-xs hover:text-white transition-colors"
          >
            {isSignUp ? "Already have an account? Sign In" : "First time here? Create Account"}
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-black px-2 text-zinc-600">Or continue with</span></div>
        </div>

        {/* Google Button */}
        <motion.button
          onClick={handleGoogleLogin}
          whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
          whileTap={{ scale: 0.98 }}
          transition={springTransition}
          className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium rounded-2xl p-4 flex items-center justify-center gap-3 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </motion.button>

      </motion.div>
    </div>
  );
}