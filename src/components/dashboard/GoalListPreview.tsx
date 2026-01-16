"use client";

import { Trash2 } from "lucide-react";
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
    <div className="space-y-3">
      <h3 className="text-zinc-500 text-xs font-bold uppercase px-1">All Goals</h3>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {goals.slice(0, 5).map((goal) => {
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
              ? "border-red-500/30 bg-red-500/5"
              : urgency === "urgent"
              ? "border-orange-500/30 bg-orange-500/5"
              : urgency === "medium"
              ? "border-yellow-500/30 bg-yellow-500/5"
              : "border-emerald-500/30 bg-emerald-500/5";

          return (
            <div key={goal.id} className={`border rounded-lg p-3 transition-all ${urgencyColor}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-white truncate">{goal.title}</h4>
                    <span className="text-sm">{emoji}</span>
                  </div>
                  <p className="text-xs text-zinc-400">{daysLeft} days left</p>
                </div>
                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="p-1.5 text-zinc-600 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-400">Progress</span>
                  <span className="text-[10px] font-bold text-zinc-300">{completed}/{total}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${progressPercent}%`,
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
