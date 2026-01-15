"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudyStore } from "../../../lib/store/useStudyStore"; // Check path!
import { supabase } from "../../../lib/supabase"; 
import { Settings, Calendar, PenTool, LogOut, Volume2, User, ChevronRight, Moon } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  
  // 1. Connect to Brain (Merged Stores)
  const { 
    examName, 
    examDate, 
    setExamDetails,
    isSoundOn,      // <--- NEW
    toggleSound     // <--- NEW
  } = useStudyStore();

  const [userEmail, setUserEmail] = useState("Loading...");

  // 2. Fetch User Email on Load
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email || "User");
    };
    getUser();
  }, []);

  // 3. Logout Handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  // Helper: Date Formatting
  const formatDateForInput = (date: Date) => {
    if (!date) return new Date().toISOString().split('T')[0];
    return new Date(date).toISOString().split('T')[0];
  };

  // Handler: Update Exam Details
  const handleUpdate = (newName: string, newDateString: string) => {
    const dateToSave = newDateString ? new Date(newDateString) : new Date();
    setExamDetails(newName, dateToSave);
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-8 pb-24">
      
      {/* Header */}
      <div className="space-y-1 mt-4">
        <h2 className="text-zinc-500 font-medium text-sm uppercase tracking-wider">Configuration</h2>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
      </div>

      {/* SECTION 1: USER PROFILE (New) */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
          <User size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate">Active Operator</h3>
          <p className="text-zinc-500 text-xs truncate">{userEmail}</p>
        </div>
      </div>

      {/* SECTION 2: ACADEMIC GOALS (Your Existing Code) */}
      <div className="space-y-4">
        <h3 className="text-zinc-500 text-xs font-bold uppercase px-1">Academic Goals</h3>
        
        {/* Goal Name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
            <PenTool size={16} />
            <span>Target Event Name</span>
          </label>
          <input 
            type="text" 
            value={examName}
            onChange={(e) => handleUpdate(e.target.value, formatDateForInput(examDate))}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-zinc-600"
            placeholder="e.g. Robotics Final"
          />
        </div>

        {/* Date Picker */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
            <Calendar size={16} />
            <span>Target Date</span>
          </label>
          <input 
            type="date" 
            value={formatDateForInput(examDate)}
            onChange={(e) => handleUpdate(examName, e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all [color-scheme:dark]"
          />
        </div>
      </div>

      {/* SECTION 3: SYSTEM PREFERENCES (New) */}
      <div className="space-y-3">
        <h3 className="text-zinc-500 text-xs font-bold uppercase px-1">System</h3>
        
        {/* Sound Toggle */}
        <div 
          onClick={toggleSound}
          className="flex items-center justify-between bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-xl active:scale-98 transition-transform cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Volume2 size={18} /></div>
            <span className="text-zinc-200 text-sm font-medium">Focus Audio</span>
          </div>
          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isSoundOn ? "bg-emerald-500" : "bg-zinc-700"}`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isSoundOn ? "translate-x-4" : "translate-x-0"}`} />
          </div>
        </div>

        {/* Theme (Visual) */}
        <div className="flex items-center justify-between bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><Moon size={18} /></div>
            <span className="text-zinc-200 text-sm font-medium">Dark Mode</span>
          </div>
          <span className="text-zinc-600 text-xs">Always On</span>
        </div>
      </div>

      {/* SECTION 4: DANGER ZONE (Logout) */}
      <div className="space-y-3 pt-4">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-between bg-red-500/5 border border-red-500/20 p-4 rounded-xl active:scale-95 transition-all hover:bg-red-500/10 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500 group-hover:bg-red-500/20"><LogOut size={18} /></div>
            <span className="text-red-400 text-sm font-medium">Terminate Session</span>
          </div>
          <ChevronRight size={16} className="text-red-500/50" />
        </button>
      </div>

      {/* Footer */}
      <div className="text-center pt-4 pb-8">
        <p className="text-zinc-700 text-[10px] uppercase tracking-widest">FlowState OS v1.0.3</p>
      </div>

    </div>
  );
}