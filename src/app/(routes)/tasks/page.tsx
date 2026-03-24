"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useStudyStore } from "../../../lib/store/useStudyStore";
import TaskFilter, { type TaskFilterType } from "../../../components/modules/dashboard/TaskFilter";
import TaskGroup, { type TaskGroupType } from "../../../components/modules/dashboard/TaskGroup";
import { Plus, Sparkles, X, FileText } from "lucide-react";
import { getDaysRemaining } from "../../../lib/calculations";

export default function TasksPage() {
  const router = useRouter();
  const { tasks, goals, fetchData, addTask, toggleTask, deleteTask, setActiveTask } = useStudyStore();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TaskFilterType>("all");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [syllabusText, setSyllabusText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle add task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await addTask(newTaskTitle, selectedGoalId);
    setNewTaskTitle("");
  };

  // Handle AI syllabus import
  const handleSyllabusImport = async () => {
    if (!syllabusText.trim()) return;

    setIsAiLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syllabus: syllabusText }),
      });

      const data = await response.json();

      if (data.subtasks && Array.isArray(data.subtasks)) {
        for (const subtask of data.subtasks) {
          await addTask(subtask, selectedGoalId);
        }
        setIsAiModalOpen(false);
        setSyllabusText("");
      }
    } catch (error) {
      console.error("AI Parsing Failed", error);
      alert("AI couldn't read that. Try pasting a cleaner list.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Start task
  const handleStartTask = (taskId: string, title: string) => {
    setActiveTask(taskId, title);
    router.push("/timer");
  };

  // Categorize tasks by date
  const categorizeTasks = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const overdue: typeof tasks = [];
    const today: typeof tasks = [];
    const upcoming: typeof tasks = [];

    tasks
      .filter((t) => !t.completed)
      .forEach((task) => {
        const goal = goals.find((g) => g.id === task.goalId);
        if (!goal) {
          today.push(task);
          return;
        }

        const daysLeft = getDaysRemaining(goal.deadline);
        if (daysLeft < 0) {
          overdue.push(task);
        } else if (daysLeft === 0) {
          today.push(task);
        } else {
          upcoming.push(task);
        }
      });

    return { overdue, today, upcoming };
  };

  const { overdue, today, upcoming } = categorizeTasks();

  // Filter tasks based on active filter
  const getFilteredTasks = () => {
    switch (activeFilter) {
      case "overdue":
        return { overdue, today: [], upcoming: [] };
      case "today":
        return { overdue: [], today, upcoming: [] };
      case "upcoming":
        return { overdue: [], today: [], upcoming };
      case "all":
      default:
        return { overdue, today, upcoming };
    }
  };

  const filteredTasks = getFilteredTasks();
  const totalIncomplete = tasks.filter((t) => !t.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col p-6 space-y-6 pb-24"
    >
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mt-4">
        <div className="space-y-1">
          <h2 className="text-zinc-500 font-medium text-sm uppercase tracking-wider">
            Action Plan
          </h2>
          <h1 className="text-4xl font-bold text-white tracking-tight">Tasks</h1>
        </div>
        <div className="h-px w-16 bg-gradient-to-r from-emerald-500/50 to-transparent" />
      </motion.div>

      {/* FILTER SECTION */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <TaskFilter
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          goalCount={goals.length}
        />
      </motion.div>

      {/* TASK INPUT AREA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 p-4 rounded-xl space-y-3"
      >
        <form onSubmit={handleAddTask} className="space-y-3">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-lg font-medium px-4 py-3 rounded-lg transition-all"
          />

          <div className="flex items-center justify-between gap-3">
            <select
              value={selectedGoalId || ""}
              onChange={(e) => setSelectedGoalId(e.target.value || null)}
              className="flex-1 bg-zinc-900/50 border border-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
            >
              <option value="">📂 General Tasks</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  🎯 {g.title}
                </option>
              ))}
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setIsAiModalOpen(true)}
              className="bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-400 rounded-lg px-3 py-2.5 transition-colors flex items-center gap-2 font-medium text-sm"
            >
              <Sparkles size={16} />
              <span className="hidden sm:inline">AI</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2.5 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add</span>
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* TASKS DISPLAY */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 space-y-4 overflow-y-auto no-scrollbar"
      >
        {filteredTasks.overdue.length === 0 &&
          filteredTasks.today.length === 0 &&
          filteredTasks.upcoming.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-white font-bold text-lg mb-2">All caught up!</h3>
            <p className="text-zinc-400 text-sm">No incomplete tasks in this filter. Nice work!</p>
          </motion.div>
        ) : (
          <>
            {filteredTasks.overdue.length > 0 && (
              <TaskGroup
                type="overdue"
                tasks={filteredTasks.overdue}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onStartTask={handleStartTask}
              />
            )}{" "}
            {filteredTasks.today.length > 0 && (
              <TaskGroup
                type="today"
                tasks={filteredTasks.today}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onStartTask={handleStartTask}
              />
            )}{" "}
            {filteredTasks.upcoming.length > 0 && (
              <TaskGroup
                type="upcoming"
                tasks={filteredTasks.upcoming}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onStartTask={handleStartTask}
              />
            )}
          </>
        )}
      </motion.div>

      {/* AI SYLLABUS MODAL */}
      <AnimatePresence>
        {isAiModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setIsAiModalOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <FileText size={20} className="text-indigo-400" />
                  Import Syllabus
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAiModalOpen(false)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </motion.button>
              </div>

              <p className="text-zinc-400 text-sm mb-4">
                Paste your syllabus or topic list. AI will break it into individual tasks for{" "}
                <span className="text-emerald-400 font-bold">
                  {goals.find((g) => g.id === selectedGoalId)?.title || "General"}
                </span>
                .
              </p>

              <textarea
                value={syllabusText}
                onChange={(e) => setSyllabusText(e.target.value)}
                placeholder="Chapter 1: Introduction
Chapter 2: Core Concepts
Module 3: Advanced Topics..."
                className="w-full h-36 bg-black/50 border border-zinc-800 rounded-lg p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 mb-4 resize-none"
              />

              <div className="mb-4">
                <label className="block text-xs text-zinc-400 font-medium mb-2">Assign to Goal</label>
                <select
                  value={selectedGoalId || ""}
                  onChange={(e) => setSelectedGoalId(e.target.value || null)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500"
                >
                  <option value="">📂 General</option>
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      🎯 {g.title}
                    </option>
                  ))}
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSyllabusImport}
                disabled={!syllabusText.trim() || isAiLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg p-3 flex items-center justify-center gap-2 transition-all"
              >
                {isAiLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span>Parsing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate Tasks</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}