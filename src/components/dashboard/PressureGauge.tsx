"use client";

import { getMotivationalMessage } from "../../lib/calculations";

interface PressureGaugeProps {
  pressure: number; // 0-100
  daysLeft: number;
}

export default function PressureGauge({ pressure, daysLeft }: PressureGaugeProps) {
  const message = getMotivationalMessage(pressure, daysLeft);

  // Get color based on pressure
  const getColor = (p: number) => {
    if (p > 70) return { bg: "bg-red-500/10", border: "border-red-500/30", bar: "bg-red-500" };
    if (p > 50) return { bg: "bg-orange-500/10", border: "border-orange-500/30", bar: "bg-orange-500" };
    if (p > 30) return { bg: "bg-yellow-500/10", border: "border-yellow-500/30", bar: "bg-yellow-500" };
    return { bg: "bg-emerald-500/10", border: "border-emerald-500/30", bar: "bg-emerald-500" };
  };

  const colors = getColor(pressure);

  return (
    <div className={`relative overflow-hidden p-5 rounded-2xl border transition-all ${colors.bg} ${colors.border}`}>
      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
            Study Pressure
          </h3>
          <p className="text-sm font-medium text-white">{message}</p>
        </div>

        {/* Pressure Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-400">Pace</span>
            <span className="text-xs font-bold text-white">{Math.round(pressure)}%</span>
          </div>
          <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.bar} transition-all duration-500 ease-out rounded-full shadow-lg`}
              style={{ width: `${Math.min(pressure, 100)}%` }}
            />
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex gap-2 pt-2">
          {pressure > 70 ? (
            <div className="flex items-center gap-2 text-red-400">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-medium">Behind Schedule</span>
            </div>
          ) : pressure > 50 ? (
            <div className="flex items-center gap-2 text-orange-400">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-xs font-medium">On Track</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium">Ahead of Schedule</span>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Blur */}
      <div
        className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-40"
        style={{
          backgroundColor:
            pressure > 70
              ? "rgb(239, 68, 68)"
              : pressure > 50
              ? "rgb(249, 115, 22)"
              : pressure > 30
              ? "rgb(234, 179, 8)"
              : "rgb(16, 185, 129)",
        }}
      />
    </div>
  );
}
