"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // <--- Import Router
import { useStudyStore } from "../../../lib/store/useStudyStore";
import { Plus, CheckCircle, Circle, Trash2, Folder, PlayCircle } from "lucide-react"; // Added PlayCircle icon
import { motion, AnimatePresence } from "framer-motion";

export default function TasksPage() {
  const router = useRouter(); // <--- Initialize Router
  const { tasks, goals, fetchData, addTask, toggleTask, deleteTask, setActiveTask } = useStudyStore();
  
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await addTask(newTaskTitle, selectedGoalId);
    setNewTaskTitle("");
  };

  // --- NEW: START TASK SESSION ---
  const handleStartTask = (taskId: string, title: string) => {
    setActiveTask(taskId, title); // Tell the store "This is the active task"
    router.push("/timer");        // Go to Timer Page
  };

  const getTasksForGoal = (goalId: string | null) => tasks.filter((t) => t.goalId === goalId);
  const generalTasks = tasks.filter((t) => !t.goalId);

  return (
    <div className="h-full flex flex-col p-6 space-y-6 pb-24">
      <div className="space-y-1 mt-4">
        <h2 className="text-zinc-500 font-medium text-sm uppercase tracking-wider">Action Plan</h2>
        <h1 className="text-3xl font-bold text-white tracking-tight">Tasks</h1>
      </div>

      {/* Input Area */}
      <form onSubmit={handleAddTask} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl space-y-3">
        <input 
          type="text" 
          placeholder="What needs to be done?"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="w-full bg-transparent text-white placeholder:text-zinc-600 focus:outline-none text-lg font-medium"
        />
        <div className="flex items-center justify-between">
          <select 
            value={selectedGoalId || ""} 
            onChange={(e) => setSelectedGoalId(e.target.value || null)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs rounded-lg px-3 py-2 outline-none focus:border-emerald-500"
          >
            <option value="">📂 General (No Goal)</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>🎯 {g.title}</option>
            ))}
          </select>
          <button 
            type="submit"
            disabled={!newTaskTitle}
            className="bg-emerald-500 hover:bg-emerald-400 text-black rounded-full p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
          </button>
        </div>
      </form>

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
                      onStart={() => handleStartTask(task.id, task.title)} // <--- CONNECTED
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
                      onStart={() => handleStartTask(task.id, task.title)} // <--- CONNECTED
                    />
                  ))}
                </AnimatePresence>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component
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
        
        {/* CLICKABLE TEXT: Starts Timer */}
        <span 
          onClick={onStart}
          className={`text-sm truncate cursor-pointer hover:text-emerald-400 transition-colors ${task.completed ? "text-zinc-600 line-through" : "text-zinc-200"}`}
        >
          {task.title}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Start Button (Visible on Hover) */}
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