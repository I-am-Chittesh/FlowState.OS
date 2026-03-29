"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useStudyStore } from "../../../lib/store/useStudyStore";
import SpotifyDeck from "../../../components/modules/music/SpotifyDeck";
import PlayerBar from "../../../components/modules/music/PlayerBar";
import SpotifyPlayerDesktop from "../../../components/modules/music/SpotifyPlayerDesktop";
import TimerCircle from "../../../components/modules/timer/TimerCircle";
import TimerSetup from "../../../components/modules/timer/TimerSetup";
import { useSpotifyPlayer } from "../../../hooks/useSpotifyPlayer";
import { Play, Pause, RotateCcw, Headphones, SkipForward } from "lucide-react";
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
  
  const [showSpotifyDeck, setShowSpotifyDeck] = useState(false);
  const [showPlayerBar, setShowPlayerBar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useSpotifyPlayer(spotifyToken);

  // Detect mobile/desktop on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full w-full flex flex-col md:grid md:grid-cols-2 gap-0"
    >
      {/* Dynamic Background: Pulse when active */}
      {isActive && (
        <motion.div
          animate={{ opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`absolute inset-0 pointer-events-none ${
            isBreak ? "bg-blue-500" : "bg-emerald-500"
          }`}
        />
      )}

      {/* LEFT SIDE - TIMER (Mobile Full Width, Desktop Left Half) */}
      <div className="h-full flex items-center justify-center p-3 relative md:border-r md:border-zinc-800/50">
        <motion.div
          className="flex flex-col items-center justify-center space-y-6 z-20"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2 z-10"
          >
            <motion.h2
              key={isBreak ? "break" : "focus"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-zinc-500 text-xs tracking-widest uppercase font-medium"
            >
              {isBreak ? "🧘 Time to Rest" : activeTaskId ? "⚡ Working on Task" : "🎯 Focus Time"}
            </motion.h2>
            <p className="text-white text-sm font-medium px-3 truncate max-w-[280px]">
              {currentTask || "Get ready to focus"}
            </p>
          </motion.div>

          {/* Timer Circle */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative z-10"
          >
            <TimerCircle
              timeLeft={timeLeft}
              isBreak={isBreak}
              isActive={isActive}
              currentSet={currentSet}
              totalSets={totalSets}
              workDuration={workDuration}
              breakDuration={breakDuration}
            />
          </motion.div>

          {/* Controls Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4 z-10"
          >
            {/* Reset */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetTimer}
              className="p-2.5 rounded-full text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 transition-all"
              title="Reset timer"
            >
              <RotateCcw size={20} />
            </motion.button>

            {/* Play/Pause Main Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={isActive ? pauseTimer : startTimer}
              className={`p-6 rounded-full transition-all shadow-2xl border-2 ${
                isActive
                  ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/30"
                  : isBreak
                  ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white hover:from-blue-400 hover:to-cyan-400 border-blue-400/30"
                  : "bg-gradient-to-br from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 border-emerald-400/30"
              }`}
              title={isActive ? "Pause" : "Start"}
            >
              {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-0.5" />}
            </motion.button>

            {/* Skip to break/next set */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={skipPhase}
              className="p-2.5 rounded-full text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 transition-all"
              title="Skip phase"
            >
              <SkipForward size={20} />
            </motion.button>
          </motion.div>

          {/* Headphone Button - Toggle Spotify Player */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="z-10 pt-2"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPlayerBar(!showPlayerBar)}
              className={`p-3 rounded-full transition-all ${
                showPlayerBar
                  ? "text-white bg-white/20 shadow-lg shadow-white/20 border border-white/40 backdrop-blur-md"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              }`}
              title="Toggle Spotify Player"
            >
              <Headphones size={20} />
            </motion.button>
          </motion.div>

          {/* Spotify Music Toggle - Only on Mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 z-10 md:hidden hidden"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPlayerBar(!showPlayerBar)}
              className={`p-2.5 rounded-full transition-all ${
                showPlayerBar
                  ? "text-[#1DB954] bg-[#1DB954]/10 shadow-lg shadow-[#1DB954]/20 border border-[#1DB954]/30"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              }`}
              title="Spotify Player"
            >
              <Headphones size={20} />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* RIGHT SIDE - PLAYER (Hidden on Mobile, Desktop Right Half) */}
      <div className="hidden md:flex h-full items-center justify-center p-3 relative bg-gradient-to-br from-zinc-900/50 to-black/30 backdrop-blur-sm">
        <SpotifyPlayerDesktop />
      </div>

      {/* Mobile Player Below Timer */}
      {showPlayerBar && isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="z-30 w-full"
        >
          <PlayerBar
            layout="horizontal"
            onClose={() => setShowPlayerBar(false)}
          />
        </motion.div>
      )}

      {/* Legacy SpotifyDeck - Hidden by default */}
      {showSpotifyDeck && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="z-50 pointer-events-auto">
          <SpotifyDeck isMobile={isMobile} onClose={() => setShowSpotifyDeck(false)} />
        </motion.div>
      )}
    </motion.div>
  );
}