"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Volume2, X } from "lucide-react";
import { useSpotifyStore } from "../../../lib/store/useSpotifyStore";
import { useSpotifyPlayer } from "../../../hooks/useSpotifyPlayer";

interface PlayerBarProps {
  layout?: "horizontal" | "expanded"; // horizontal mini player, expanded full player
  onClose?: () => void;
}

export default function PlayerBar({ layout = "horizontal", onClose }: PlayerBarProps) {
  const { isConnected, currentTrack, isPlaying } = useSpotifyStore();
  const { togglePlayPause, nextTrack, prevTrack } = useSpotifyPlayer();

  const [isExpanded, setIsExpanded] = useState(layout === "expanded");
  const [volume, setVolume] = useState(70);

  if (!isConnected || !currentTrack) {
    return null;
  }

  // Horizontal mini player (for mobile timer)
  if (layout === "horizontal" && !isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-24 md:bottom-0 md:right-0 left-0 md:w-80 bg-gradient-to-t from-black via-zinc-950 to-zinc-900 border border-zinc-800 rounded-t-2xl md:rounded-l-2xl md:rounded-t-none p-4 space-y-3 z-40"
      >
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0">
          {currentTrack.image && (
            <motion.img
              src={currentTrack.image}
              alt={currentTrack.name}
              className="w-12 h-12 rounded-lg shadow-lg flex-shrink-0 object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold truncate">{currentTrack.name}</p>
            <p className="text-zinc-400 text-xs truncate">{currentTrack.artist}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(true)}
            className="text-zinc-500 hover:text-white transition-colors flex-shrink-0"
          >
            <Volume2 size={18} />
          </motion.button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${currentTrack.progress}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevTrack}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <SkipBack size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePlayPause}
            className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full transition-colors"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextTrack}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <SkipForward size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-400 transition-colors"
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
