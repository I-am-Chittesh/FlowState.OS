"use client";

import { Calendar, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between hover:border-zinc-700 transition-colors"
      >
        <div className="flex items-center gap-3 text-zinc-500">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">No Active Goals</span>
        </div>
        <span className="text-xs text-zinc-600 bg-zinc-900 px-3 py-1 rounded-lg font-medium">Set in Config</span>
      </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`relative overflow-hidden p-6 rounded-2xl border transition-all hover:shadow-lg hover:shadow-emerald-500/10 ${colors.bg} ${colors.border}`}
    >
      {/* Top Section - Title & Icon */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-3"
          >
            <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
              Primary Objective
            </span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-xl"
            >
              {emoji}
            </motion.span>
          </motion.div>
          <h2 className="text-2xl font-bold text-white leading-tight">
            {title}
          </h2>
        </div>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}
        >
          <Calendar size={20} className={colors.text} />
        </motion.div>
      </div>

      {/* Days & Progress Section */}
      <div className="flex items-end gap-3 mb-6 relative z-10">
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-white tracking-tighter"
        >
          {daysLeft}
        </motion.span>
        <span className={`mb-1.5 text-sm font-medium ${colors.text}`}>
          days left
        </span>
      </div>

      {/* Progress Bar & Chapters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 space-y-3"
      >
        <div className="flex justify-between items-center">
          <span className="text-xs text-zinc-400 font-medium">Progress</span>
          <motion.span
            key={`${completedChapters}-${totalChapters}`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className={`text-xs font-bold ${colors.text}`}
          >
            {completedChapters}/{totalChapters} chapters
          </motion.span>
        </div>
        <div className="h-2.5 w-full bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-700/30">
          <motion.div
            className={`h-full rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
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
      </motion.div>

      {/* Decorative Blur - Animated */}
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
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
    </motion.div>
  );
}