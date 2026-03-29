"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Volume2, X } from "lucide-react";

interface PlayerBarProps {
  layout?: "horizontal" | "expanded"; // horizontal mini player, expanded full player
  onClose?: () => void;
}

// Mock track data for demonstration
const mockTrack = {
  name: "Sample Track",
  artist: "Sample Artist",
  image: undefined,
  progress: 45,
  progressTime: "1:23",
  duration: "3:45",
};

export default function PlayerBar({ layout = "horizontal", onClose }: PlayerBarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(layout === "expanded");
  const [volume, setVolume] = useState(70);
  const currentTrack = mockTrack;

  const togglePlayPause = () => setIsPlaying(!isPlaying);
  const nextTrack = () => console.log("Next track");
  const prevTrack = () => console.log("Previous track");

  // Horizontal mini player (for mobile timer)
  if (layout === "horizontal" && !isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="w-full backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-5 space-y-4 z-40 mx-3 mb-4"
      >
        {/* Track Info with Album Art */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Album Thumbnail */}
          <motion.div className="w-14 h-14 rounded-lg bg-gradient-to-br from-orange-400 via-red-400 to-pink-400 flex-shrink-0 shadow-lg flex items-center justify-center text-xl">
            🎵
          </motion.div>

          {/* Track Details */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold truncate">{currentTrack.name}</p>
            <p className="text-emerald-400/70 text-xs truncate">{currentTrack.artist}</p>
            <div className="text-xs text-zinc-500 mt-1">{currentTrack.progressTime} / {currentTrack.duration}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <motion.div className="w-full h-1 bg-zinc-800/50 rounded-full overflow-hidden backdrop-blur">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${currentTrack.progress}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
          />
        </motion.div>

        {/* Controls */}
        <div className="flex items-center justify-between px-2">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevTrack}
            className="text-emerald-400/60 hover:text-emerald-400 transition-colors"
          >
            <SkipBack size={18} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlayPause}
            className="bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white p-2.5 rounded-full transition-all shadow-lg shadow-emerald-500/30"
          >
            {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" className="ml-0.5" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextTrack}
            className="text-emerald-400/60 hover:text-emerald-400 transition-colors"
          >
            <SkipForward size={18} />
          </motion.button>

          {/* Close */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors ml-auto"
          >
            <X size={16} />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Expanded player view (desktop sidebar or modal)
  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm md:relative md:inset-auto md:bg-transparent md:backdrop-blur-none"
    >
      <motion.div className="w-full max-w-md bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-2xl p-8 space-y-6 md:rounded-none">
        {/* Close Button - Mobile only */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(false)}
          className="md:hidden absolute top-4 right-4 text-zinc-500 hover:text-white"
        >
          <X size={24} />
        </motion.button>

        {/* Album Art */}
        {currentTrack.image && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative mx-auto w-48 h-48 rounded-xl shadow-2xl overflow-hidden"
          >
            <img
              src={currentTrack.image}
              alt={currentTrack.name}
              className="w-full h-full object-cover"
            />
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: isPlaying ? 3 : 1, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
              className="absolute inset-0 border-4 border-emerald-500/30 rounded-xl"
            />
          </motion.div>
        )}

        {/* Track Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">{currentTrack.name}</h2>
          <p className="text-zinc-400">{currentTrack.artist}</p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-2">
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden cursor-pointer group">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentTrack.progress}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:from-emerald-400 group-hover:to-teal-400 transition-colors"
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-500 font-medium">
            <span>{currentTrack.progressTime || "0:00"}</span>
            <span>{currentTrack.duration || "0:00"}</span>
          </div>
        </motion.div>

        {/* Volume Control */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-2">
          <div className="flex items-center gap-3">
            <Volume2 size={16} className="text-zinc-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="flex-1 h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
            <span className="text-xs text-zinc-500 min-w-fit">{volume}%</span>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevTrack}
            className="text-zinc-400 hover:text-white transition-colors p-2"
          >
            <SkipBack size={24} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePlayPause}
            className="bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white p-4 rounded-full transition-all shadow-lg shadow-emerald-500/30"
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextTrack}
            className="text-zinc-400 hover:text-white transition-colors p-2"
          >
            <SkipForward size={24} />
          </motion.button>
        </motion.div>

        {/* Collapse Button - Mobile only */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(false)}
          className="md:hidden w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-lg transition-colors"
        >
          Minimize
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
