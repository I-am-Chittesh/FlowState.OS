"use client";

import { Calendar, AlertCircle } from "lucide-react";
import { getDaysRemaining, getProgressPercentage, getPressureIndex, getUrgencyTag, getUrgencyEmoji, getUrgencyColors } from "../../lib/calculations";

interface DeadlineCardProps {
  title?: string;
  dueDate?: Date;
  completedChapters?: number;
  totalChapters?: number;
}

export default function DeadlineCard({
  title,
  dueDate,
  completedChapters = 0,
  totalChapters = 1,
}: DeadlineCardProps) {
  // Fallback if no goal is set
  if (!title || !dueDate) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3 text-zinc-500">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">No Active Goals</span>
        </div>
        <span className="text-xs text-zinc-600 bg-zinc-900 px-2 py-1 rounded">Set in Config</span>
      </div>
    );
  }

  // Calculate metrics
  const daysLeft = getDaysRemaining(dueDate);
  const totalDays = Math.max(1, Math.ceil((dueDate.getTime() - new Date(dueDate.getTime() - 365 * 24 * 60 * 60 * 1000).getTime()) / (1000 * 60 * 60 * 24)));
  const pressure = getPressureIndex(completedChapters, totalChapters, daysLeft, totalDays);
  const urgency = getUrgencyTag(pressure, daysLeft);
  const progressPercent = getProgressPercentage(completedChapters, totalChapters);
  const emoji = getUrgencyEmoji(urgency);
  const colors = getUrgencyColors(urgency);

  return (
    <div className={`relative overflow-hidden p-5 rounded-2xl border transition-all ${colors.bg} ${colors.border}`}>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
              Primary Objective
            </span>
            <span className="text-lg">{emoji}</span>
          </div>
          <h2 className="text-xl font-bold text-white leading-tight">
            {title}
          </h2>
        </div>
        <div className={`p-2 rounded-lg ${colors.bg}`}>
          <Calendar size={20} className={colors.text} />
        </div>
      </div>

      {/* Days & Progress */}
      <div className="flex items-end gap-3 mb-4 relative z-10">
        <span className="text-4xl font-bold text-white tracking-tighter">
          {daysLeft}
        </span>
        <span className={`mb-1.5 text-sm font-medium ${colors.text}`}>
          days left
        </span>
      </div>

      {/* Progress Bar & Chapters */}
      <div className="relative z-10 space-y-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-zinc-400">Progress</span>
          <span className={`text-xs font-bold ${colors.text}`}>
            {completedChapters}/{totalChapters} chapters
          </span>
        </div>
        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out rounded-full`}
            style={{
              width: `${progressPercent}%`,
              backgroundColor:
                urgency === 'critical'
                  ? '#ef4444'
                  : urgency === 'urgent'
                  ? '#f97316'
                  : urgency === 'medium'
                  ? '#eab308'
                  : '#10b981',
            }}
          />
        </div>
      </div>

      {/* Decorative Blur */}
      <div
        className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-40`}
        style={{
          backgroundColor:
            urgency === 'critical'
              ? 'rgb(239, 68, 68)'
              : urgency === 'urgent'
              ? 'rgb(249, 115, 22)'
              : urgency === 'medium'
              ? 'rgb(234, 179, 8)'
              : 'rgb(16, 185, 129)',
        }}
      />
    </div>
  );
}