"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";
import { useStudyStore } from "../../lib/store/useStudyStore";
import { registerReminder, requestNotificationPermission } from "../../lib/notifications/notificationService";
import ReminderModal from "./ReminderModal";

interface RemindersButtonProps {
  taskId: string;
  taskTitle?: string;
}

export default function RemindersButton({ taskId, taskTitle = "Task" }: RemindersButtonProps) {
  const { reminders, addReminder, deleteReminder, tasks } = useStudyStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Find reminder for this task
  const taskReminder = reminders.find((r) => r.task_id === taskId);
  
  // Get the actual task title from tasks array
  const task = tasks.find((t) => t.id === taskId);
  const displayTaskTitle = task?.title || taskTitle;

  const handleAddReminder = async (reminderTime: Date) => {
    setIsLoading(true);
    try {
      // Request notification permission first
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        alert("Notifications are disabled. Please enable them in your browser settings.");
        setIsLoading(false);
        return;
      }

      // Add reminder to database
      await addReminder(taskId, reminderTime);
      
      // Register with service worker
      await registerReminder({
        id: `temp-${Date.now()}`, // Temporary ID, will be replaced after DB response
        task_id: taskId,
        task_title: displayTaskTitle,
        reminder_time: reminderTime.toISOString(),
        is_sent: false
      });
      
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to add reminder:", error);
      alert("Failed to set reminder. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReminder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!taskReminder) return;

    setIsLoading(true);
    try {
      await deleteReminder(taskReminder.id);
    } catch (error) {
      console.error("Failed to delete reminder:", error);
      alert("Failed to delete reminder. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (taskReminder) {
    // Show existing reminder
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/50 rounded-lg">
        <Bell size={14} className="text-blue-400" />
        <span className="text-xs text-blue-300 truncate">
          {new Date(taskReminder.reminder_time).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })}
        </span>
        <button
          onClick={handleDeleteReminder}
          disabled={isLoading}
          className="ml-1 p-0.5 hover:bg-blue-400/20 rounded transition-colors disabled:opacity-50"
          title="Remove reminder"
        >
          <X size={12} className="text-blue-300" />
        </button>
      </div>
    );
  }

  // Show add reminder button
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
        className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-slate-200 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        title="Add reminder"
      >
        <Bell size={14} />
        <span>Remind</span>
      </button>

      <ReminderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleAddReminder}
        isLoading={isLoading}
      />
    </>
  );
}
