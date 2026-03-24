"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useStudyStore } from "../../../lib/store/useStudyStore";
import DeadlineCard from "../../../components/dashboard/DeadlineCard";
import GoalListPreview from "../../../components/dashboard/GoalListPreview";
import TasksPreview from "../../../components/dashboard/TasksPreview";
import StatsBar from "../../../components/dashboard/StatsBar";
import { Quote } from "lucide-react";
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "tween" as const, duration: 0.5, ease: "easeOut" as const }
    },
  };

  return (
    <motion.div
      className="h-full flex flex-col p-6 space-y-6 pb-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* HEADER SECTION */}
      <motion.div variants={itemVariants} className="space-y-2 mt-4">
        <h2 className="text-zinc-500 font-medium text-sm uppercase tracking-wider">
          FlowState.os
        </h2>
        <h1 className="text-4xl font-bold text-white tracking-tight">
          {greeting}, {userName || "User"}.
        </h1>
        <div className="h-px w-16 bg-gradient-to-r from-emerald-500/50 to-transparent" />
      </motion.div>

      {/* STATS BAR - Mobile Horizontal Layout */}
      <motion.div variants={itemVariants} className="md:hidden">
        <StatsBar
          level={level}
          currentLevelProgress={currentLevelProgress}
          xpForNextLevel={xpForNextLevel}
          totalTime={totalTime}
          sessionsCompleted={sessionsCompleted}
          layout="horizontal"
        />
      </motion.div>

      {/* DIVIDER */}
      <motion.div variants={itemVariants} className="h-px bg-gradient-to-r from-zinc-700/50 via-zinc-700/20 to-transparent" />

      {/* PRIMARY OBJECTIVE SECTION */}
      <motion.div variants={itemVariants} className="space-y-2">
        <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest px-1">
          📍 Your Focus
        </h3>
        <DeadlineCard
          title={priorityGoal?.title}
          dueDate={priorityGoal?.deadline}
          completedChapters={priorityGoal?.completedChapters}
          totalChapters={priorityGoal?.totalChapters}
        />
      </motion.div>

      {/* SECONDARY GOALS SECTION */}
      {goals.length > 1 && (
        <motion.div variants={itemVariants} className="space-y-2">
          <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest px-1">
            🎯 Other Goals
          </h3>
          <GoalListPreview goals={sortedGoals.slice(1)} onDeleteGoal={deleteGoal} />
        </motion.div>
      )}

      {/* TASKS PREVIEW SECTION */}
      <motion.div variants={itemVariants} className="space-y-2">
        <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest px-1">
          ⚡ Today's Action Items
        </h3>
        <TasksPreview
          tasks={tasks}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
          onAddTask={(title) => addTask(title, priorityGoal?.id || null)}
        />
      </motion.div>

      {/* MOTIVATIONAL QUOTE SECTION */}
      <motion.div
        variants={itemVariants}
        className="mt-auto bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 border border-zinc-800/50 rounded-xl p-5 flex gap-4 items-start"
      >
        <div className="p-2.5 bg-white/5 rounded-full shrink-0 mt-1">
          <Quote size={16} className="text-emerald-400/70" />
        </div>
        <div className="flex-1">
          <p className="text-zinc-200 text-sm font-medium leading-relaxed italic">
            "{quote.text}"
          </p>
          <p className="text-zinc-500 text-[11px] uppercase tracking-widest mt-3">
            — {quote.author}
          </p>
        </div>
      </motion.div>

      {/* FOOTER NOTE */}
      <motion.div variants={itemVariants} className="text-center pt-2 border-t border-zinc-900/50">
        <p className="text-zinc-600 text-xs font-light">Made for my Pookies ❤️</p>
      </motion.div>
    </motion.div>
  );
}