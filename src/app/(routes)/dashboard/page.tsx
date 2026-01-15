"use client";

import { useEffect, useState } from "react";
import { useStudyStore } from "../../../lib/store/useStudyStore";
import DeadlineCard from "../../../components/dashboard/DeadlineCard";
import { Flame, Timer, Trophy, Quote } from "lucide-react";

export default function DashboardPage() {
  const { totalTime, sessionsCompleted, xp, level, goals, fetchData } = useStudyStore();
  const [greeting, setGreeting] = useState("Good Morning");
  const [quote, setQuote] = useState({ text: "Stay Hard.", author: "Goggins" });

  // 1. Load Data on Mount
  useEffect(() => {
    fetchData(); // <--- Fetch Goals & Tasks from Supabase
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
    
    // Random Quote
    const quotes = [
      { text: "We don't stop when we're tired. We stop when we're done.", author: "David Goggins" },
      { text: "He who has a why to live can bear almost any how.", author: "Nietzsche" },
      { text: "Discipline is doing what you hate to do like you love it.", author: "Mike Tyson" },
      { text: "The only easy day was yesterday.", author: "Navy SEALs" },
      { text: "Suffer the pain of discipline or the pain of regret.", author: "Unknown" },
      { text: "Don't count the days, make the days count.", author: "Muhammad Ali" }
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, [fetchData]);

  // 2. Find the Priority Goal (Closest Deadline)
  const sortedGoals = [...goals].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  const priorityGoal = sortedGoals.length > 0 ? sortedGoals[0] : null;

  // Level Logic
  const xpForNextLevel = 500;
  const currentLevelProgress = xp % xpForNextLevel;
  const percentage = (currentLevelProgress / xpForNextLevel) * 100;

  return (
    <div className="h-full flex flex-col p-6 space-y-6 pb-24">
      
      {/* Header */}
      <div className="space-y-1 mt-4">
        <h2 className="text-zinc-500 font-medium text-sm uppercase tracking-wider">
          FlowState.os
        </h2>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {greeting}, Chittesh.
        </h1>
      </div>

      {/* Level Progress */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-5 rounded-2xl relative overflow-hidden">
        <div className="flex justify-between items-end mb-2">
          <div>
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Trophy size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Current Rank</span>
            </div>
            <span className="text-3xl font-bold text-white">Level {level}</span>
          </div>
          <div className="text-right">
             <span className="text-xs text-zinc-400">{currentLevelProgress} / {xpForNextLevel} XP</span>
          </div>
        </div>
        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-amber-500 transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Timer size={40} />
          </div>
          <span className="text-zinc-500 text-xs font-medium uppercase">Focus Time</span>
          <div>
            <span className="text-3xl font-bold text-white">{(totalTime / 60).toFixed(1)}</span>
            <span className="text-sm text-zinc-500 ml-1">hrs</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Flame size={40} />
          </div>
          <span className="text-zinc-500 text-xs font-medium uppercase">Sessions</span>
          <div>
            <span className="text-3xl font-bold text-white">{sessionsCompleted}</span>
            <span className="text-sm text-zinc-500 ml-1">done</span>
          </div>
        </div>
      </div>

      {/* Dynamic Priority Goal */}
      <div>
        <DeadlineCard 
          title={priorityGoal?.title} 
          dueDate={priorityGoal?.deadline} 
        />
      </div>

      {/* Footer */}
      <div className="mt-auto bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 flex gap-3 items-center">
        <div className="p-2 bg-white/5 rounded-full shrink-0">
          <Quote size={16} className="text-zinc-400" />
        </div>
        <div>
          <p className="text-zinc-300 text-xs font-medium italic">"{quote.text}"</p>
          <p className="text-zinc-500 text-[10px] uppercase tracking-wider mt-1">— {quote.author}</p>
        </div>
      </div>

    </div>
  );
}