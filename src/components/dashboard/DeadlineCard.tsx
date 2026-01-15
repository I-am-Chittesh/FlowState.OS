"use client";

import { differenceInDays, format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useStudyStore } from "../../lib/store/useStudyStore"; // <--- The Critical Connection

export default function DeadlineCard() {
  // 1. Get the REAL data from the Settings (Store)
  const { examName, examDate } = useStudyStore();
  
  // 2. Safety Check: If date is missing/broken, default to today to prevent crash
  const targetDate = examDate ? new Date(examDate) : new Date();
  const today = new Date();

  // 3. The Math
  const daysLeft = differenceInDays(targetDate, today);
  
  // Calculate Progress (Assuming a 90-day semester cycle for visual bar)
  const totalDuration = 90; 
  const progress = Math.max(0, Math.min(100, ((totalDuration - daysLeft) / totalDuration) * 100));

  return (
    <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-4">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <CalendarDays className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            {/* Dynamic Name from Settings */}
            <h3 className="text-white font-medium text-sm">{examName || "My Goal"}</h3>
            {/* Dynamic Date from Settings */}
            <p className="text-zinc-500 text-xs">{format(targetDate, "MMM do, yyyy")}</p>
          </div>
        </div>
        <span className="text-2xl font-bold text-white tabular-nums">
          {daysLeft}d
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
          <span>Semester Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

    </div>
  );
}