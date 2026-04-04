"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";
import { useStudyStore } from "../../lib/store/useStudyStore";
import { requestNotificationPermission } from "../../lib/notifications/notificationService";
import ReminderModal from "./ReminderModal";

interface RemindersButtonProps {
  taskId: string;
}

export default function RemindersButton({ taskId }: RemindersButtonProps) {
  const { reminders, addReminder, deleteReminder } = useStudyStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Find reminder for this task
  const taskReminder = reminders.find((r) => r.task_id === taskId);

  const handleAddReminder = async (reminderTime: Date) => {
    setIsLoading(true);
    try {
      console.log('📌 Starting reminder creation for task:', taskId);
      
      // Request notification permission first
      const hasPermission = await requestNotificationPermission();
      console.log('✅ Notification permission:', hasPermission);
      
      if (!hasPermission) {
        alert("Notifications are disabled. Please enable them in your browser settings.");
        setIsLoading(false);
        return;
      }

      console.log('📌 Adding reminder at:', reminderTime);
      // Add reminder - this now handles service worker registration
      await addReminder(taskId, reminderTime);
      
      console.log('✅ Reminder added successfully');
      setIsModalOpen(false);
    } catch (error) {
      console.error("❌ Failed to add reminder:", error);
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
