"use client";

import { Check, Trash2, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "../../../lib/store/useStudyStore";
import RemindersButton from "../../notifications/RemindersButton";

export type TaskGroupType = "overdue" | "today" | "upcoming";

interface TaskGroupProps {
  type: TaskGroupType;
  tasks: Task[];
  onToggleTask: (id: string, completed: boolean) => void;
  onDeleteTask: (id: string) => void;
  onStartTask?: (id: string, title: string) => void;
}

export default function TaskGroup({
  type,
  tasks,
  onToggleTask,
  onDeleteTask,
  onStartTask,
}: TaskGroupProps) {
  if (tasks.length === 0) return null;

  const groupConfig = {
    overdue: {
      label: "Overdue",
      icon: "🔴",
      emoji: "⚠️",
      color: "from-red-500/10 to-orange-500/5 border-red-500/20",
      textColor: "text-red-400",
    },
    today: {
      label: "Today's Focus",
      icon: "🟡",
      emoji: "⚡",
      color: "from-amber-500/10 to-yellow-500/5 border-amber-500/20",
      textColor: "text-amber-400",
    },
    upcoming: {
      label: "Upcoming",
      icon: "🟢",
      emoji: "🔮",
      color: "from-emerald-500/10 to-teal-500/5 border-emerald-500/20",
      textColor: "text-emerald-400",
    },
  };

  const config = groupConfig[type];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 px-2 mb-3">
        <span className="text-lg">{config.emoji}</span>
        <h3 className={`text-xs font-bold uppercase tracking-widest ${config.textColor}`}>
          {config.label}
        </h3>
        <span className={`ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full bg-zinc-800/50`}>
          {tasks.length}
        </span>
      </div>

      {/* Tasks in Section */}
      <div className={`space-y-2 p-3 rounded-lg border bg-gradient-to-br ${config.color}`}>
        <AnimatePresence mode="popLayout">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              layout
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ delay: index * 0.03 }}
              className="group flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all"
            >
              {/* Checkbox */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggleTask(task.id, !task.completed)}
                className={`p-2 rounded-lg border-2 transition-all flex-shrink-0 ${
                  task.completed
                    ? "bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/20"
                    : "border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500/5"
                }`}
              >
                {task.completed && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Check size={14} className="text-emerald-500" />
                  </motion.div>
                )}
              </motion.button>

              {/* Task Title */}
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm font-medium block truncate transition-all ${
                    task.completed
                      ? "line-through text-zinc-500"
                      : "text-white/90 group-hover:text-white"
                  }`}
                >
                  {task.title}
                </span>
              </div>

              {/* Action Buttons - Hidden until hover on desktop, visible on mobile */}
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {!task.completed && (
                  <RemindersButton taskId={task.id} />
                )}

                {onStartTask && !task.completed && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onStartTask(task.id, task.title)}
                    className="p-2 text-emerald-500 hover:text-emerald-400 transition-colors rounded hover:bg-emerald-500/10"
                    title="Start Task"
                  >
                    <PlayCircle size={16} />
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDeleteTask(task.id)}
                  className="p-2 text-zinc-600 hover:text-red-500 transition-colors rounded hover:bg-red-500/10"
                  title="Delete Task"
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
