"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStudyStore } from "../../../lib/store/useStudyStore";
import { CheckCircle2, Plus, Circle, Trash2, ArrowRight } from "lucide-react";

export default function TasksPage() {
  // 1. Connect to the Brain
  const { tasks, addTask, toggleTask, deleteTask, setTask } = useStudyStore();
  const router = useRouter();
  
  // Local state for the input box
  const [inputValue, setInputValue] = useState("");

  // Handler: Add a new task
  const handleAdd = () => {
    if (inputValue.trim()) {
      addTask(inputValue);
      setInputValue(""); // Clear the box
    }
  };

  // Handler: Click text to "Focus" on this task
  const handleFocus = (taskTitle: string) => {
    setTask(taskTitle); // Update the Timer text
    router.push("/timer"); // Jump to Timer page
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      
      {/* Header */}
      <div className="space-y-1 mt-4">
        <h2 className="text-zinc-500 font-medium text-sm uppercase tracking-wider">
          Priorities
        </h2>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Tasks
        </h1>
      </div>

      {/* Input Area (The "Add" Bar) */}
      <div className="flex gap-2">
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add a new task..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600"
        />
        <button 
          onClick={handleAdd}
          className="bg-white text-black p-4 rounded-xl hover:bg-zinc-200 active:scale-95 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* The List */}
      <div className="space-y-3 pb-20 overflow-y-auto">
        {tasks.length === 0 && (
          <div className="text-center text-zinc-600 py-10 text-sm">
            No tasks yet. Time to plan.
          </div>
        )}

        {tasks.map((task) => (
          <div 
            key={task.id}
            className="group flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all"
          >
            <div className="flex items-center gap-4 overflow-hidden">
              {/* Checkbox */}
              <button 
                onClick={() => toggleTask(task.id)}
                className="text-zinc-500 hover:text-emerald-500 transition-colors shrink-0"
              >
                {task.completed ? (
                  <CheckCircle2 className="text-emerald-500" size={24} />
                ) : (
                  <Circle size={24} />
                )}
              </button>
              
              {/* Task Text (Click to Focus) */}
              <span 
                onClick={() => !task.completed && handleFocus(task.title)}
                className={`text-sm font-medium truncate cursor-pointer select-none ${
                  task.completed ? "text-zinc-600 line-through" : "text-zinc-200 hover:text-white"
                }`}
              >
                {task.title}
              </span>
            </div>

            {/* Actions (Delete or Focus Icon) */}
            <div className="flex items-center gap-2">
              {!task.completed && (
                <button 
                  onClick={() => handleFocus(task.title)}
                  className="p-2 text-zinc-600 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ArrowRight size={18} />
                </button>
              )}
              
              <button 
                onClick={() => deleteTask(task.id)}
                className="p-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}