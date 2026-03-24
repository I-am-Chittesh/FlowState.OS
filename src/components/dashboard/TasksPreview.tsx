"use client";

import { Plus, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "../../lib/store/useStudyStore";
import { useState } from "react";

interface TasksPreviewProps {
  tasks: Task[];
  onToggleTask: (id: string, completed: boolean) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (title: string) => void;
}

export default function TasksPreview({
  tasks,
  onToggleTask,
  onDeleteTask,
  onAddTask,
}: TasksPreviewProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Show incomplete tasks only
  const incompleteTasks = tasks.filter((t) => !t.completed).slice(0, 5);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle);
      setNewTaskTitle("");
      setIsAddingTask(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-3"
    >
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {incompleteTasks.length === 0 && !isAddingTask && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-zinc-900/50 border border-dashed border-zinc-700 rounded-lg p-6 text-center"
            >
              <p className="text-xs text-zinc-500 mb-4 font-medium">No tasks yet. You're all set! 🎉</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddingTask(true)}
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors bg-emerald-500/10 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20"
              >
                <Plus size={14} />
                Add First Task
              </motion.button>
            </motion.div>
          )}

          {/* Task List */}
          {incompleteTasks.map((task, index) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex items-center gap-3 group hover:bg-zinc-900 hover:border-zinc-700 transition-all"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggleTask(task.id, !task.completed)}
                className={`p-2 rounded-lg border-2 transition-all flex-shrink-0 ${
                  task.completed
                    ? "bg-emerald-500/20 border-emerald-500"
                    : "border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500/5"
                }`}
              >
                {task.completed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Check size={14} className="text-emerald-500" />
                  </motion.div>
                )}
              </motion.button>

              <span className={`flex-1 text-sm font-medium transition-all ${task.completed ? "line-through text-zinc-500" : "text-white"}`}>
                {task.title}
              </span>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDeleteTask(task.id)}
                className="p-2 text-zinc-600 hover:text-red-500 transition-colors rounded hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </motion.button>
            </motion.div>
          ))}

          {/* Add Task Input */}
          {isAddingTask && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-zinc-900/50 border border-emerald-500/30 rounded-lg p-4 space-y-3"
            >
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                placeholder="Add a task..."
                autoFocus
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddTask}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                >
                  Add
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsAddingTask(false);
                    setNewTaskTitle("");
                  }}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add First Task Button - Show when no tasks exist and not adding */}
        {incompleteTasks.length > 0 && !isAddingTask && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddingTask(true)}
            className="w-full py-3 border border-dashed border-zinc-700 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-300 hover:border-zinc-600 transition-all flex items-center justify-center gap-2 group"
          >
            <Plus size={14} className="group-hover:rotate-90 transition-transform" />
            Add Another Task
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
