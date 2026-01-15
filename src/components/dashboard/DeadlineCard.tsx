"use client";

import { Calendar, Clock, AlertCircle } from "lucide-react";

interface DeadlineCardProps {
  title?: string;
  dueDate?: Date;
}

export default function DeadlineCard({ title, dueDate }: DeadlineCardProps) {
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

  // Calculate Time Left
  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const isUrgent = diffDays <= 3;

  return (
    <div className={`relative overflow-hidden p-5 rounded-2xl border transition-all ${isUrgent ? "bg-red-500/10 border-red-500/20" : "bg-indigo-500/10 border-indigo-500/20"}`}>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 ${isUrgent ? "text-red-400" : "text-indigo-400"}`}>
            Primary Objective
          </h3>
          <h2 className="text-xl font-bold text-white leading-tight">
            {title}
          </h2>
        </div>
        <div className={`p-2 rounded-lg ${isUrgent ? "bg-red-500/20 text-red-400" : "bg-indigo-500/20 text-indigo-400"}`}>
          <Calendar size={20} />
        </div>
      </div>

      <div className="flex items-end gap-2 relative z-10">
        <span className="text-4xl font-bold text-white tracking-tighter">
          {diffDays}
        </span>
        <span className={`mb-1.5 text-sm font-medium ${isUrgent ? "text-red-300" : "text-indigo-300"}`}>
          days remaining
        </span>
      </div>

      {/* Decorative Blur */}
      <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-40 ${isUrgent ? "bg-red-500" : "bg-indigo-500"}`} />
    </div>
  );
}