"use client";

import { useStudyStore } from "../../../lib/store/useStudyStore";
import { Settings, Calendar, PenTool } from "lucide-react";

export default function SettingsPage() {
  // 1. Connect to the Brain
  const { examName, examDate, setExamDetails } = useStudyStore();

  // Helper: Convert Date object to "YYYY-MM-DD" string for the input
  const formatDateForInput = (date: Date) => {
    // If date is broken/missing, default to today
    if (!date) return new Date().toISOString().split('T')[0];
    return new Date(date).toISOString().split('T')[0];
  };

  // Handler: Update Store when user types
  const handleUpdate = (newName: string, newDateString: string) => {
    // If date string is empty, fallback to today
    const dateToSave = newDateString ? new Date(newDateString) : new Date();
    setExamDetails(newName, dateToSave);
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-8">
      
      {/* Header */}
      <div className="space-y-1 mt-4">
        <h2 className="text-zinc-500 font-medium text-sm uppercase tracking-wider">
          Configuration
        </h2>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Settings
        </h1>
      </div>

      {/* Settings Form */}
      <div className="space-y-6">
        
        {/* Input 1: The Goal Name */}
        <div className="space-y-3">
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

        {/* Input 2: The Date Picker */}
        <div className="space-y-3">
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

        {/* Info Card */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-3">
          <Settings className="text-indigo-400 shrink-0 mt-1" size={20} />
          <div>
            <h3 className="text-indigo-300 font-medium text-sm">Auto-Save Active</h3>
            <p className="text-indigo-400/60 text-xs mt-1">
              Changes are saved automatically to your local storage. The Dashboard will update immediately.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}