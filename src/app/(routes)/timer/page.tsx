"use client";

import { useEffect, useRef } from "react";
import { useStudyStore } from "../../../lib/store/useStudyStore";
import SpotifyPlayer from "../../../components/player/SpotifyPlayer";
import TimerCircle from "../../../components/modules/timer/TimerCircle";
import TimerSetup from "../../../components/modules/timer/TimerSetup";
import { useSpotifyPlayer } from "../../../hooks/useSpotifyPlayer";
import { Play, Pause, RotateCcw, Headphones, Music2, SkipForward } from "lucide-react";
import confetti from "canvas-confetti";

export default function TimerPage() {
  const { 
    timeLeft, 
    isActive,
    isBreak,
    currentTask,
    activeTaskId,
    currentSet,
    totalSets,
    workDuration,
    breakDuration,
    isSetupMode,
    startTimer, 
    isSoundOn,
    spotifyToken,
    pauseTimer, 
    resetTimer,
    startTimerSession,
    skipPhase,
    tick,
    toggleSound,
    sessionJustCompleted
  } = useStudyStore();
  
  useSpotifyPlayer(spotifyToken);

  // Timer Engine
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft >= 0) {
      interval = setInterval(() => tick(), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, tick]);

  // Confetti on session completion (all sets done)
  useEffect(() => {
    if (sessionJustCompleted) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#059669', '#047857']
      });
    }
  }, [sessionJustCompleted]);

  if (isSetupMode) {
    return <TimerSetup />;
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-3 space-y-4">
      
      {/* Dynamic Background: Pulse when active */}
      {isActive && (
        <div className={`absolute inset-0 pointer-events-none transition-colors duration-300 ${
          isBreak 
            ? "bg-blue-500/5 animate-pulse" 
            : "bg-emerald-500/5 animate-pulse"
        }`} />
      )}

      {/* Header */}
      <div className="text-center space-y-0.5 z-10">
        <h2 className="text-zinc-500 text-xs tracking-widest uppercase">
          {isBreak ? "Time to Rest" : activeTaskId ? "Working on Task" : "Focus Time"}
        </h2>
        <h1 className="text-white text-sm font-medium px-3 truncate max-w-[280px]">
          {currentTask}
        </h1>
      </div>

      {/* Timer Circle */}
      <div className="relative z-10 scale-75">
        <TimerCircle
          timeLeft={timeLeft}
          isBreak={isBreak}
          isActive={isActive}
          currentSet={currentSet}
          totalSets={totalSets}
          workDuration={workDuration}
          breakDuration={breakDuration}
        />
      </div>

      {/* Controls Row */}
      <div className="flex items-center gap-3 z-10">
        
        {/* Reset */}
        <button 
          onClick={resetTimer}
          className="p-2.5 rounded-full text-zinc-400 hover:bg-zinc-800 transition-all active:scale-95 hover:text-zinc-200"
          title="Reset timer"
        >
          <RotateCcw size={20} />
        </button>

        {/* Play/Pause Main Button */}
        <button 
          onClick={isActive ? pauseTimer : startTimer}
          className={`p-6 rounded-full transition-all active:scale-95 shadow-2xl ${
            isActive 
              ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" 
              : isBreak
              ? "bg-blue-500 text-white hover:bg-blue-400"
              : "bg-emerald-500 text-black hover:bg-emerald-400"
          }`}
          title={isActive ? "Pause" : "Start"}
        >
          {isActive ? (
            <Pause size={24} fill="currentColor" />
          ) : (
            <Play size={24} fill="currentColor" />
          )}
        </button>

        {/* Skip to break/next set */}
        <button 
          onClick={skipPhase}
          className="p-2.5 rounded-full text-zinc-400 hover:bg-zinc-800 transition-all active:scale-95 hover:text-zinc-200"
          title="Skip phase"
        >
          <SkipForward size={20} />
        </button>

      </div>

      {/* Sound & Spotify Controls */}
      <div className="flex items-center gap-2 z-10">
        {/* Sound Toggle */}
        <button 
          onClick={toggleSound}
          className={`p-2.5 rounded-full transition-all active:scale-95 ${
            isSoundOn ? "text-indigo-400 bg-indigo-500/10" : "text-zinc-400 hover:bg-zinc-800"
          }`}
          title="Toggle music"
        >
          <Headphones size={20} />
        </button>
      </div>

      {/* Music Player Card (Appears when Sound is toggled ON) */}
      {isSoundOn && (
        <div className="animate-in slide-in-from-bottom-10 fade-in duration-500 z-50 scale-90 origin-bottom">
          <SpotifyPlayer />
        </div>
      )}

    </div>
  );
}