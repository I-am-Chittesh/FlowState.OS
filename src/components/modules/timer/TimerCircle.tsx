"use client";

import React from "react";

interface TimerCircleProps {
  timeLeft: number;
  isBreak: boolean;
  isActive: boolean;
  currentSet: number;
  totalSets: number;
  workDuration: number;
  breakDuration: number;
}

export default function TimerCircle({
  timeLeft,
  isBreak,
  isActive,
  currentSet,
  totalSets,
  workDuration,
  breakDuration,
}: TimerCircleProps) {
  const totalDuration = isBreak ? breakDuration : workDuration;
  const progress = Math.max(0, (totalDuration - timeLeft) / totalDuration);

  const circumference = 2 * Math.PI * 90; // radius 90
  const strokeDashoffset = circumference * (1 - progress);

  // Color coding
  const ringColor = isBreak ? "#3b82f6" : "#10b981"; // Blue for break, Green for work
  const bgColor = isBreak ? "rgba(59, 130, 246, 0.05)" : "rgba(16, 185, 129, 0.05)";
  const textColor = isActive ? "text-white" : "text-zinc-600";

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center space-y-6">
      {/* SVG Progress Ring */}
      <div className="relative">
        <svg width={220} height={220} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={110}
            cy={110}
            r={90}
            stroke="#27272a"
            strokeWidth={3}
            fill="none"
          />

          {/* Progress ring with animation */}
          <circle
            cx={110}
            cy={110}
            r={90}
            stroke={ringColor}
            strokeWidth={3}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Center display */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center space-y-2 rounded-full transition-colors duration-500 ${
            isActive ? bgColor : ""
          }`}
        >
          <div className={`text-6xl font-bold tracking-tighter tabular-nums transition-colors duration-500 ${textColor}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
            {isBreak ? "Break" : "Work"}
          </div>
        </div>
      </div>

      {/* Set Progress Info */}
      <div className="text-center space-y-2">
        <div className="text-sm font-medium text-zinc-400">
          Set <span className="text-emerald-400 font-semibold">{currentSet}</span> of{" "}
          <span className="text-emerald-400 font-semibold">{totalSets}</span>
        </div>

        {/* Set indicators */}
        <div className="flex gap-2 justify-center">
          {Array.from({ length: totalSets }).map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx < currentSet
                  ? "bg-emerald-500 scale-125"
                  : "bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
