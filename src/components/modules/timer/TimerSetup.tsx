"use client";

import { useState } from "react";
import { useStudyStore } from "../../../lib/store/useStudyStore";

interface Preset {
  name: string;
  work: number;
  break: number;
  sets: number;
}

const PRESETS: Preset[] = [
  { name: "25/5/4", work: 25 * 60, break: 5 * 60, sets: 4 },
  { name: "45/15/3", work: 45 * 60, break: 15 * 60, sets: 3 },
  { name: "15/3/5", work: 15 * 60, break: 3 * 60, sets: 5 },
];

export default function TimerSetup() {
  const { 
    workDuration, 
    breakDuration, 
    totalSets,
    setTimerConfig, 
    startTimerSession 
  } = useStudyStore();

  const [workMins, setWorkMins] = useState(Math.floor(workDuration / 60));
  const [workSecs, setWorkSecs] = useState(workDuration % 60);
  const [breakMins, setBreakMins] = useState(Math.floor(breakDuration / 60));
  const [breakSecs, setBreakSecs] = useState(breakDuration % 60);
  const [sets, setSets] = useState(totalSets);

  const handleStart = () => {
    const newWorkDuration = workMins * 60 + workSecs;
    const newBreakDuration = breakMins * 60 + breakSecs;
    setTimerConfig(newWorkDuration, newBreakDuration, sets);
    startTimerSession();
  };

  const applyPreset = (preset: Preset) => {
    setWorkMins(Math.floor(preset.work / 60));
    setWorkSecs(preset.work % 60);
    setBreakMins(Math.floor(preset.break / 60));
    setBreakSecs(preset.break % 60);
    setSets(preset.sets);
  };

  const handleInputChange = (value: string, max: number) => {
    const num = parseInt(value) || 0;
    return Math.max(0, Math.min(num, max));
  };

  const TimeSection = ({ 
    minValue, 
    onMinChange, 
    secValue, 
    onSecChange, 
    label,
    bgColor
  }: { 
    minValue: number;
    onMinChange: (v: number) => void;
    secValue: number;
    onSecChange: (v: number) => void;
    label: string;
    bgColor: string;
  }) => (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-xs font-semibold tracking-widest text-zinc-400">{label}</span>
      <div className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl ${bgColor} border-2 border-zinc-700 transition-all focus-within:border-zinc-500 focus-within:bg-opacity-80`}>
        <input
          type="number"
          min="0"
          max="99"
          value={minValue.toString().padStart(2, "0")}
          onChange={(e) => onMinChange(handleInputChange(e.target.value, 99))}
          className="w-12 bg-transparent text-center text-2xl font-bold text-zinc-300 focus:text-white focus:outline-none transition-colors"
          placeholder="00"
        />
        <span className="text-xl font-bold text-zinc-500">:</span>
        <input
          type="number"
          min="0"
          max="59"
          value={secValue.toString().padStart(2, "0")}
          onChange={(e) => onSecChange(handleInputChange(e.target.value, 59))}
          className="w-12 bg-transparent text-center text-2xl font-bold text-zinc-300 focus:text-white focus:outline-none transition-colors"
          placeholder="00"
        />
      </div>
      <span className="text-xs text-zinc-600 font-medium">mm:ss</span>
    </div>
  );

  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-6 space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-white">Timer Setup</h1>
        <p className="text-zinc-400 text-xs">Configure your session</p>
      </div>

      {/* Presets */}
      <div className="flex gap-2 flex-wrap justify-center">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => applyPreset(preset)}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition-all active:scale-95"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Time Configuration */}
      <div className="flex flex-col items-center gap-5">
        {/* Work and Break in a row */}
        <div className="flex gap-6 items-end justify-center">
          {/* Work Time */}
          <TimeSection
            minValue={workMins}
            onMinChange={setWorkMins}
            secValue={workSecs}
            onSecChange={setWorkSecs}
            label="Work"
            bgColor="bg-emerald-500/10"
          />

          {/* Break Time */}
          <TimeSection
            minValue={breakMins}
            onMinChange={setBreakMins}
            secValue={breakSecs}
            onSecChange={setBreakSecs}
            label="Break"
            bgColor="bg-blue-500/10"
          />
        </div>

        {/* Sets */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs font-semibold tracking-widest text-zinc-400">Sets</span>
          <div className="flex items-center px-4 py-2.5 rounded-xl bg-indigo-500/10 border-2 border-zinc-700 transition-all focus-within:border-zinc-500 focus-within:bg-opacity-80">
            <input
              type="number"
              min="1"
              max="20"
              value={sets.toString().padStart(2, "0")}
              onChange={(e) => setSets(handleInputChange(e.target.value, 20) || 1)}
              className="w-12 bg-transparent text-center text-2xl font-bold text-zinc-300 focus:text-white focus:outline-none transition-colors"
              placeholder="04"
            />
          </div>
          <span className="text-xs text-zinc-600 font-medium">total</span>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg transition-all active:scale-95 text-sm shadow-lg"
      >
        Start Session
      </button>
    </div>
  );
}
