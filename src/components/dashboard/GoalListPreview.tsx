"use client";

import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Goal } from "../../lib/store/useStudyStore";
import { getDaysRemaining, getProgressPercentage, getPressureIndex, getUrgencyTag, getUrgencyEmoji } from "../../lib/calculations";

interface GoalListPreviewProps {
  goals: Goal[];
  onDeleteGoal: (id: string) => void;
}

export default function GoalListPreview({ goals, onDeleteGoal }: GoalListPreviewProps) {
  if (goals.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-3"
    >
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {goals.slice(0, 5).map((goal, index) => {
          const daysLeft = getDaysRemaining(goal.deadline);
          const totalDays = Math.max(
            1,
            Math.ceil(
              (goal.deadline.getTime() - new Date(goal.deadline.getTime() - 365 * 24 * 60 * 60 * 1000).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          );
          const completed = goal.completedChapters || 0;
          const total = goal.totalChapters || 1;
          const pressure = getPressureIndex(completed, total, daysLeft, totalDays);
          const urgency = getUrgencyTag(pressure, daysLeft);
          const emoji = getUrgencyEmoji(urgency);
          const progressPercent = getProgressPercentage(completed, total);

          const urgencyColor =
            urgency === "critical"
              ? "border-red-500/40 bg-red-500/5 hover:bg-red-500/10"
              : urgency === "urgent"
              ? "border-orange-500/40 bg-orange-500/5 hover:bg-orange-500/10"
              : urgency === "medium"
              ? "border-yellow-500/40 bg-yellow-500/5 hover:bg-yellow-500/10"
              : "border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10";

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              className={`border rounded-lg p-4 transition-all group hover:shadow-lg ${urgencyColor}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-white truncate">{goal.title}</h4>
                    <motion.span
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                      className="text-base flex-shrink-0"
                    >
                      {emoji}
                    </motion.span>
                  </div>
                  <p className="text-xs text-zinc-400 font-medium">{daysLeft} days left</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDeleteGoal(goal.id)}
                  className="p-1.5 text-zinc-600 hover:text-red-500 transition-colors shrink-0 rounded hover:bg-red-500/10"
                >
                  <Trash2 size={14} />
                </motion.button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-400 font-medium">Progress</span>
                  <span className="text-[10px] font-bold text-zinc-300">{completed}/{total}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800/70 rounded-full overflow-hidden border border-zinc-700/30">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      backgroundColor:
                        urgency === "critical"
                          ? "#ef4444"
                          : urgency === "urgent"
                          ? "#f97316"
                          : urgency === "medium"
                          ? "#eab308"
                          : "#10b981",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
