"use client";

import { motion } from "framer-motion";
import { Trophy, Timer, Flame } from "lucide-react";

interface StatsBarProps {
  level: number;
  currentLevelProgress: number;
  xpForNextLevel: number;
  totalTime: number;
  sessionsCompleted: number;
  layout?: "horizontal" | "vertical"; // horizontal for mobile, vertical for desktop sidebar
}

export default function StatsBar({
  level,
  currentLevelProgress,
  xpForNextLevel,
  totalTime,
  sessionsCompleted,
  layout = "horizontal",
}: StatsBarProps) {
  const percentage = (currentLevelProgress / xpForNextLevel) * 100;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (layout === "vertical") {
    // Desktop sidebar layout
    return (
      <motion.div
        className="space-y-4 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Level Card */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4 rounded-xl"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy size={16} className="text-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
              Level
            </span>
          </div>
          <span className="text-3xl font-bold text-white block">{level}</span>
          <div className="text-[9px] text-zinc-500 mt-1">
            {currentLevelProgress}/{xpForNextLevel} XP
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div variants={itemVariants} className="px-2">
          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Secondary Stats */}
        <motion.div variants={itemVariants} className="space-y-2 text-left">
          <div className="flex items-center justify-between bg-zinc-900/40 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <Timer size={14} className="text-blue-500" />
              <span className="text-[10px] text-zinc-400">Focus</span>
            </div>
            <span className="text-sm font-bold text-white">
              {(totalTime / 60).toFixed(1)}h
            </span>
          </div>
          <div className="flex items-center justify-between bg-zinc-900/40 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <Flame size={14} className="text-orange-500" />
              <span className="text-[10px] text-zinc-400">Sessions</span>
            </div>
            <span className="text-sm font-bold text-white">{sessionsCompleted}</span>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Mobile horizontal layout - scrollable pills
  return (
    <motion.div
      className="flex gap-3 overflow-x-auto pb-2 no-scrollbar"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Level Pill */}
      <motion.div
        variants={itemVariants}
        className="flex-shrink-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-full px-4 py-2.5 flex items-center gap-2 min-w-fit"
      >
        <Trophy size={16} className="text-amber-500" />
        <div>
          <div className="text-[10px] text-amber-500 font-bold uppercase">Lvl</div>
          <div className="text-sm font-bold text-white">{level}</div>
        </div>
      </motion.div>

      {/* Focus Time Pill */}
      <motion.div
        variants={itemVariants}
        className="flex-shrink-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-full px-4 py-2.5 flex items-center gap-2 min-w-fit"
      >
        <Timer size={16} className="text-blue-500" />
        <div>
          <div className="text-[10px] text-blue-500 font-bold uppercase">Focus</div>
          <div className="text-sm font-bold text-white">{(totalTime / 60).toFixed(1)}h</div>
        </div>
      </motion.div>

      {/* Sessions Pill */}
      <motion.div
        variants={itemVariants}
        className="flex-shrink-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-full px-4 py-2.5 flex items-center gap-2 min-w-fit"
      >
        <Flame size={16} className="text-orange-500" />
        <div>
          <div className="text-[10px] text-orange-500 font-bold uppercase">Sessions</div>
          <div className="text-sm font-bold text-white">{sessionsCompleted}</div>
        </div>
      </motion.div>

      {/* XP Progress Indicator */}
      <motion.div
        variants={itemVariants}
        className="flex-shrink-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-full px-4 py-2.5 flex items-center gap-2 min-w-fit"
      >
        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 relative">
          <div
            className="absolute inset-0 rounded-full border-2 border-amber-500/30"
            style={{
              borderRightColor: "transparent",
              borderBottomColor: "transparent",
              transform: `rotate(${(percentage / 100) * 360}deg)`,
            }}
          />
        </div>
        <div>
          <div className="text-[10px] text-emerald-500 font-bold uppercase">XP</div>
          <div className="text-sm font-bold text-white">
            {currentLevelProgress}/{xpForNextLevel}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
