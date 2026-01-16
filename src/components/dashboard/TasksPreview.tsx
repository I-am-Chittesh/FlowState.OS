"use client";

import { Plus, Check, Trash2 } from "lucide-react";
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
    <div className="space-y-3">
      <h3 className="text-zinc-500 text-xs font-bold uppercase px-1">Today's Tasks</h3>

      <div className="space-y-2">
        {incompleteTasks.length === 0 && !isAddingTask && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-center">
            <p className="text-xs text-zinc-500 mb-3">No tasks yet. Create one to get started!</p>
            <button
              onClick={() => setIsAddingTask(true)}
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              <Plus size={14} />
              Add First Task
            </button>
          </div>
        )}

        {/* Task List */}
        {incompleteTasks.map((task) => (
          <div
            key={task.id}
            className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 flex items-center gap-3 group hover:bg-zinc-900 transition-colors"
          >
            <button
              onClick={() => onToggleTask(task.id, !task.completed)}
              className={`p-1.5 rounded border-2 transition-all flex-shrink-0 ${
                task.completed
                  ? "bg-emerald-500/20 border-emerald-500"
                  : "border-zinc-700 hover:border-emerald-500"
              }`}
            >
              {task.completed && <Check size={14} className="text-emerald-500" />}
            </button>

            <span className={`flex-1 text-sm ${task.completed ? "line-through text-zinc-500" : "text-white"}`}>
              {task.title}
            </span>

            <button
              onClick={() => onDeleteTask(task.id)}
              className="p-1.5 text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {/* Add Task Input */}
        {isAddingTask && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 space-y-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              placeholder="Add a task..."
              autoFocus
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddTask}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-1.5 rounded transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle("");
                }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-1.5 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Show Add Button if not adding and have tasks */}
        {!isAddingTask && incompleteTasks.length > 0 && (
          <button
            onClick={() => setIsAddingTask(true)}
            className="w-full text-xs font-bold text-zinc-400 hover:text-emerald-500 py-2 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            Add Task
          </button>
        )}
      </div>
    </div>
  );
}
