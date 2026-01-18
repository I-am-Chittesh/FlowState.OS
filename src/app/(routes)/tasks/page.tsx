"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudyStore } from "../../../lib/store/useStudyStore";
import { Plus, CheckCircle, Circle, Trash2, Folder, PlayCircle, Sparkles, X, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TasksPage() {
  const router = useRouter();
  const { tasks, goals, fetchData, addTask, toggleTask, deleteTask, setActiveTask } = useStudyStore();
  
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  
  // --- NEW: MODAL STATE ---
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [syllabusText, setSyllabusText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await addTask(newTaskTitle, selectedGoalId);
    setNewTaskTitle("");
  };

  // --- NEW: SYLLABUS PARSER LOGIC ---
  const handleSyllabusImport = async () => {
    if (!syllabusText.trim()) return;

    setIsAiLoading(true);
    try {
      // 1. Send text to your API
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syllabus: syllabusText }), 
      });

      const data = await response.json();

      if (data.subtasks && Array.isArray(data.subtasks)) {
        // 2. Add each task to the store
        for (const subtask of data.subtasks) {
          await addTask(subtask, selectedGoalId);
        }
        setIsAiModalOpen(false); // Close window
        setSyllabusText("");     // Clear text
      }
    } catch (error) {
      console.error("AI Parsing Failed", error);
      alert("AI couldn't read that. Try pasting a cleaner list.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleStartTask = (taskId: string, title: string) => {
    setActiveTask(taskId, title); 
    router.push("/timer");        
  };

  const getTasksForGoal = (goalId: string | null) => tasks.filter((t) => t.goalId === goalId);
  const generalTasks = tasks.filter((t) => !t.goalId);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="h-full flex flex-col p-6 space-y-6 pb-24 relative">
      
      {/* Header */}
      <div className="space-y-1 mt-4">
        <h2 className="text-zinc-500 font-medium text-sm uppercase tracking-wider">Action Plan</h2>
        <h1 className="text-3xl font-bold text-white tracking-tight">Tasks</h1>
      </div>

      {/* Main Input Area */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl space-y-3">
        <input 
          type="text" 
          placeholder="Add a single task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask(e)}
          className="w-full bg-transparent text-white placeholder:text-zinc-600 focus:outline-none text-lg font-medium"
        />
        <div className="flex items-center justify-between">
          <select 
            value={selectedGoalId || ""} 
            onChange={(e) => setSelectedGoalId(e.target.value || null)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs rounded-lg px-3 py-2 outline-none focus:border-emerald-500 max-w-[50%]"
          >
            <option value="">📂 General</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>🎯 {g.title}</option>
            ))}
          </select>
          
          <div className="flex gap-2">
            {/* NEW: AI IMPORT BUTTON */}
            <button 
              onClick={() => setIsAiModalOpen(true)}
              className="bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/50 text-indigo-400 rounded-full p-2 transition-colors flex items-center gap-2"
              title="Import Syllabus with AI"
            >
              <Sparkles size={18} />
              <span className="text-xs font-bold hidden sm:inline pr-1">AI Import</span>
            </button>

            <button 
              onClick={handleAddTask}
              disabled={!newTaskTitle}
              className="bg-emerald-500 hover:bg-emerald-400 text-black rounded-full p-2 transition-colors disabled:opacity-50"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* TASK LISTS */}
      <div className="space-y-6 overflow-y-auto no-scrollbar">
        {goals.map((goal) => {
          const goalTasks = getTasksForGoal(goal.id);
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 border-b border-zinc-800/50 pb-2">
                <Folder size={16} />
                <h3 className="text-sm font-bold uppercase tracking-wide">{goal.title}</h3>
                <span className="text-[10px] text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full ml-auto">
                  {new Date(goal.deadline).toLocaleDateString()}
                </span>
              </div>
              <div className="space-y-2">
                {goalTasks.length === 0 && <p className="text-zinc-700 text-xs italic pl-6">No tasks yet.</p>}
                <AnimatePresence>
                  {goalTasks.map((task) => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onToggle={() => toggleTask(task.id, !task.completed)}
                      onDelete={() => deleteTask(task.id)}
                      onStart={() => handleStartTask(task.id, task.title)} 
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}

        {generalTasks.length > 0 && (
          <div className="space-y-2 pt-4">
             <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-800/50 pb-2">
                <Folder size={16} />
                <h3 className="text-sm font-bold uppercase tracking-wide">General</h3>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {generalTasks.map((task) => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onToggle={() => toggleTask(task.id, !task.completed)}
                      onDelete={() => deleteTask(task.id)}
                      onStart={() => handleStartTask(task.id, task.title)} 
                    />
                  ))}
                </AnimatePresence>
              </div>
          </div>
        )}
      </div>

      {/* --- AI SYLLABUS MODAL (Pop-up) --- */}
      {isAiModalOpen && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-2xl p-4 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <FileText size={18} className="text-indigo-400"/> 
                Import Syllabus
              </h3>
              <button onClick={() => setIsAiModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>
            
            <p className="text-zinc-400 text-xs mb-3">
              Paste your list of topics below. The AI will organize them into individual tasks for: 
              <span className="text-emerald-400 font-bold ml-1">
                {goals.find(g => g.id === selectedGoalId)?.title || "General"}
              </span>
            </p>

            <textarea 
              value={syllabusText}
              onChange={(e) => setSyllabusText(e.target.value)}
              placeholder="e.g. Module 1: Intro to AI, History of Robotics. Module 2: Sensors, Actuators..."
              className="w-full h-32 bg-black/50 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 mb-4 resize-none"
            />

            <div className="mb-4">
              <label className="block text-xs text-zinc-400 font-medium mb-2">Assign to Goal</label>
              <select 
                value={selectedGoalId || ""} 
                onChange={(e) => setSelectedGoalId(e.target.value || null)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
              >
                <option value="">📂 General</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>🎯 {g.title}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleSyllabusImport}
              disabled={!syllabusText || isAiLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl p-3 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isAiLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Parsing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate Task List</span>
                </>
              )}
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
}

function TaskItem({ task, onToggle, onDelete, onStart }: { task: any, onToggle: () => void, onDelete: () => void, onStart: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="group flex items-center justify-between bg-zinc-900/30 border border-zinc-800/50 p-3 rounded-xl hover:bg-zinc-900 transition-colors"
    >
      <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
        <button onClick={onToggle} className={`shrink-0 ${task.completed ? "text-emerald-500" : "text-zinc-600 hover:text-zinc-400"}`}>
          {task.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
        </button>
        <span 
          onClick={onStart}
          className={`text-sm truncate cursor-pointer hover:text-emerald-400 transition-colors ${task.completed ? "text-zinc-600 line-through" : "text-zinc-200"}`}
        >
          {task.title}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {!task.completed && (
           <button onClick={onStart} className="text-emerald-500/50 hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
             <PlayCircle size={16} />
           </button>
        )}
        <button onClick={onDelete} className="text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}