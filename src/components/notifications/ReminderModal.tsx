"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar, X, Check } from "lucide-react";

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reminderTime: Date) => void;
  isLoading?: boolean;
}

export default function ReminderModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: ReminderModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("09:00");

  // Get today's date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get tomorrow's date as default
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const todayDate = getTodayDate();
  const defaultDate = getTomorrowDate();

  const handleConfirm = () => {
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }

    // Combine date and time
    const [year, month, day] = selectedDate.split("-");
    const [hours, minutes] = selectedTime.split(":");
    const reminderDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
    );

    onConfirm(reminderDate);
    resetForm();
  };

  const resetForm = () => {
    setSelectedDate("");
    setSelectedTime("09:00");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Format display date nicely
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "Select date";
    
    if (dateString === todayDate) return "Today";
    if (dateString === defaultDate) return "Tomorrow";
    
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:bottom-auto md:left-1/2 md:top-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md"
          >
            <div className="bg-slate-900 rounded-t-2xl md:rounded-2xl p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Add Reminder</h2>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Date Picker */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <Calendar size={16} />
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate || defaultDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={isLoading}
                  min={todayDate}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
                />
              </div>

              {/* Time Picker */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <Clock size={16} />
                  Time
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
                />
              </div>

              {/* Display Selected DateTime */}
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700">
                <p className="text-sm text-slate-400 mb-1">Reminder scheduled for:</p>
                <p className="text-lg font-semibold text-white">
                  {formatDisplayDate(selectedDate || defaultDate)} at {selectedTime}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin">⏳</div>
                      Setting...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Set Reminder
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
