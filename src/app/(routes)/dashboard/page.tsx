"use client";

import { useEffect, useState } from "react";
import { useStudyStore } from "../../../lib/store/useStudyStore";
import DeadlineCard from "../../../components/dashboard/DeadlineCard";
import GoalListPreview from "../../../components/dashboard/GoalListPreview";
import TasksPreview from "../../../components/dashboard/TasksPreview";
import { Flame, Timer, Trophy, Quote, Zap } from "lucide-react";
import { getDaysRemaining, getPressureIndex } from "../../../lib/calculations";

export default function DashboardPage() {
  const {
    totalTime,
    sessionsCompleted,
    xp,
    level,
    goals,
    tasks,
    fetchData,
    addTask,
    toggleTask,
    deleteTask,
    deleteGoal,
    pressureByGoalId,
    calculateAllPressures,
    userName,
  } = useStudyStore();

  const [greeting, setGreeting] = useState("Good Morning");
  const [quote, setQuote] = useState({ text: "Stay Hard.", author: "Goggins" });
  const [streak, setStreak] = useState(0);

  // 1. Load Data on Mount
  useEffect(() => {
    fetchData();

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
      { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
    ];
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    // Simple streak: sessions completed
    setStreak(sessionsCompleted);

    // Calculate all pressures
    calculateAllPressures();
  }, [fetchData, sessionsCompleted, calculateAllPressures]);

  // 2. Find the Priority Goal (Closest Deadline)
  const sortedGoals = [...goals].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );
  const priorityGoal = sortedGoals.length > 0 ? sortedGoals[0] : null;

  // 3. Calculate pressure for priority goal
  let priorityPressure = 0;
  let priorityDaysLeft = 0;
  if (priorityGoal) {
    priorityDaysLeft = getDaysRemaining(priorityGoal.deadline);
    const totalDays = Math.max(
      1,
      Math.ceil(
        (priorityGoal.deadline.getTime() -
          new Date(priorityGoal.deadline.getTime() - 365 * 24 * 60 * 60 * 1000).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    const completed = priorityGoal.completedChapters || 0;
    const total = priorityGoal.totalChapters || 1;
    priorityPressure = getPressureIndex(completed, total, priorityDaysLeft, totalDays);
  }

  // 4. Level Logic (Keep XP)
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
          {greeting}, {userName || "User"}.
        </h1>
      </div>

      {/* XP Progress - Keep it! */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-5 rounded-2xl relative">
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <Trophy size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Current Rank</span>
            </div>
            <span className="text-4xl font-bold text-white block">Level {level}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-400 whitespace-nowrap ml-2">
              {currentLevelProgress}/{xpForNextLevel}
            </span>
            <div className="text-[9px] text-zinc-500">XP</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden relative z-10">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Decorative Blur Background */}
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-amber-500/20 blur-[80px] opacity-30 rounded-full" />
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

        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={40} />
          </div>
          <span className="text-zinc-500 text-xs font-medium uppercase">Streak</span>
          <div>
            <span className="text-3xl font-bold text-white">{streak}</span>
            <span className="text-sm text-zinc-500 ml-1">sessions</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Timer size={40} />
          </div>
          <span className="text-zinc-500 text-xs font-medium uppercase">Goals</span>
          <div>
            <span className="text-3xl font-bold text-white">{goals.length}</span>
            <span className="text-sm text-zinc-500 ml-1">active</span>
          </div>
        </div>
      </div>

      {/* Primary Goal Card */}
      <div>
        <DeadlineCard
          title={priorityGoal?.title}
          dueDate={priorityGoal?.deadline}
          completedChapters={priorityGoal?.completedChapters}
          totalChapters={priorityGoal?.totalChapters}
        />
      </div>

      {/* All Goals List - NEW */}
      {goals.length > 1 && (
        <GoalListPreview goals={sortedGoals.slice(1)} onDeleteGoal={deleteGoal} />
      )}

      {/* Tasks Preview - NEW */}
      <TasksPreview
        tasks={tasks}
        onToggleTask={toggleTask}
        onDeleteTask={deleteTask}
        onAddTask={(title) => addTask(title, priorityGoal?.id || null)}
      />

      {/* Footer - Keep Quote */}
      <div className="mt-auto bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 flex gap-3 items-center">
        <div className="p-2 bg-white/5 rounded-full shrink-0">
          <Quote size={16} className="text-zinc-400" />
        </div>
        <div>
          <p className="text-zinc-300 text-xs font-medium italic">"{quote.text}"</p>
          <p className="text-zinc-500 text-[10px] uppercase tracking-wider mt-1">
            — {quote.author}
          </p>
        </div>
      </div>

      {/* Author Note */}
      <div className="text-center pt-4 border-t border-zinc-900/50">
        <p className="text-zinc-600 text-xs">Made for my Pookies❤️</p>
      </div>
    </div>
  );
}