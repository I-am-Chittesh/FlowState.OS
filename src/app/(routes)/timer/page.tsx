"use client";

import { useEffect } from "react";
import { useStudyStore } from "../../../lib/store/useStudyStore";
import SpotifyPlayer from "../../../components/player/SpotifyPlayer";
import { useSpotifyPlayer } from "../../../hooks/useSpotifyPlayer";
import { Play, Pause, RotateCcw, Headphones, Music2 } from "lucide-react";
import confetti from "canvas-confetti";

export default function TimerPage() {
  const { 
    timeLeft, 
    isActive, 
    isBreak,
    currentTask,    // <--- New State
    startTimer, 
    isSoundOn,
    spotifyToken,
    pauseTimer, 
    resetTimer, 
    tick,
    toggleSound     // <--- New Action
  } = useStudyStore();
  
  useSpotifyPlayer(spotifyToken);

  // Timer Engine
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => tick(), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, tick]);

  // Confetti Trigger
  useEffect(() => {
    if (timeLeft === 0 && !isBreak) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#059669']
      });
    }
  }, [timeLeft, isBreak]);

  // Time Formatter
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Spotify Handler
  const openSpotify = () => {
    // Opens "Lo-Fi Beats" playlist
    window.open('https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn', '_blank');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 space-y-12 relative">
      
      {/* Dynamic Background: Pulse when active */}
      {isActive && (
        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />
      )}

      {/* Header */}
      <div className="text-center space-y-2 z-10">
        <h2 className="text-zinc-500 text-sm tracking-widest uppercase">
          {isBreak ? "Break Time" : "Current Focus"}
        </h2>
        <h1 className="text-white text-xl font-medium px-4 truncate max-w-[300px]">
          {currentTask}
        </h1>
      </div>

      {/* The Clock */}
      <div className="relative z-10">
        <div className={`text-8xl font-bold tracking-tighter tabular-nums transition-colors duration-500 ${
          isActive ? "text-white" : "text-zinc-600"
        }`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center gap-6 z-10">
        
        {/* Reset */}
        <button 
          onClick={resetTimer}
          className="p-4 rounded-full text-zinc-400 hover:bg-zinc-800 transition-all active:scale-95"
        >
          <RotateCcw size={24} />
        </button>

        {/* Play/Pause Main Button */}
        <button 
          onClick={isActive ? pauseTimer : startTimer}
          className={`p-8 rounded-full transition-all active:scale-95 shadow-2xl ${
            isActive 
              ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" 
              : "bg-emerald-500 text-black hover:bg-emerald-400"
          }`}
        >
          {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
        </button>

        {/* Sound Toggle */}
        <button 
          onClick={toggleSound}
          className={`p-4 rounded-full transition-all active:scale-95 ${
            isSoundOn ? "text-indigo-400 bg-indigo-500/10" : "text-zinc-400 hover:bg-zinc-800"
          }`}
        >
          <Headphones size={24} />
        </button>

      </div>

      {/* Music Player Card (Appears when Sound is toggled ON) */}
      {/* Spotify Player: Slides up when "Headphones" is clicked */}
      {isSoundOn && (
        <div className="animate-in slide-in-from-bottom-10 fade-in duration-500 z-50">
           <SpotifyPlayer />
        </div>
      )}

    </div>
  );
}