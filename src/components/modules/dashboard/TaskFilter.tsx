"use client";

import { motion, AnimatePresence } from "framer-motion";

export type TaskFilterType = "all" | "today" | "overdue" | "by-goal";

interface TaskFilterProps {
  activeFilter: TaskFilterType;
  onFilterChange: (filter: TaskFilterType) => void;
  goalCount?: number;
}

export default function TaskFilter({
  activeFilter,
  onFilterChange,
  goalCount = 0,
}: TaskFilterProps) {
  const filters: { id: TaskFilterType; label: string; icon: string; badge?: number }[] = [
    { id: "all", label: "All", icon: "📋" },
    { id: "today", label: "Today", icon: "📅" },
    { id: "overdue", label: "Overdue", icon: "⏰" },
    { id: "by-goal", label: "By Goal", icon: "🎯", badge: goalCount },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex gap-2 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory"
    >
      {filters.map((filter) => (
        <motion.button
          key={filter.id}
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onFilterChange(filter.id)}
          className={`flex-shrink-0 px-4 py-2.5 rounded-full font-medium text-xs uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap border snap-start ${
            activeFilter === filter.id
              ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30"
              : "bg-zinc-900/70 text-zinc-300 border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800"
          }`}
        >
          <span className="text-base">{filter.icon}</span>
          {filter.label}
          <AnimatePresence>
            {filter.badge && filter.badge > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="ml-1 px-2 py-0.5 bg-black/30 rounded-full text-[9px] font-bold"
              >
                {filter.badge}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      ))}
    </motion.div>
  );
}
