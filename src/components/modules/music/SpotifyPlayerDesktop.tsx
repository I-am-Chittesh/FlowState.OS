"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";

interface SpotifyPlayerDesktopProps {
  isPlaying?: boolean;
  onPlayPause?: () => void;
}

export default function SpotifyPlayerDesktop({ isPlaying = false, onPlayPause }: SpotifyPlayerDesktopProps) {
  const [isPlayerPlaying, setIsPlayerPlaying] = useState(isPlaying);
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(45);

  const mockTrack = {
    name: "Focus Flow",
    artist: "Deep Study",
    progressTime: "1:23",
    duration: "3:45",
  };

  const handlePlayPause = () => {
    setIsPlayerPlaying(!isPlayerPlaying);
    onPlayPause?.();
  };

  const handlePrevious = () => console.log("Previous track");
  const handleNext = () => console.log("Next track");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col items-center justify-center p-6 gap-8"
    >
      {/* Glassmorphic Player Card */}
      <motion.div
        className="w-full max-w-sm backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-3xl p-8 shadow-2xl"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Album Art Container */}
        <motion.div
          className="relative w-full aspect-square mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-400 via-red-400 to-pink-400 shadow-lg"
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
            animate={isPlayerPlaying ? { opacity: [0.3, 0.5, 0.3] } : { opacity: 0.3 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
            🎵
          </div>

          {/* Rotating Border Effect */}
          {isPlayerPlaying && (
            <motion.div
              className="absolute inset-0 border-2 border-transparent border-t-emerald-400 border-r-teal-400 rounded-2xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.div>

        {/* Track Info */}
        <div className="text-center mb-8 space-y-2">
          <h3 className="text-white font-bold text-xl">{mockTrack.name}</h3>
          <p className="text-emerald-400/80 text-sm font-medium">{mockTrack.artist}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 space-y-2">
          <motion.div
            className="h-1 bg-zinc-700/50 rounded-full overflow-hidden backdrop-blur"
            whileHover={{ height: 4 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
          <div className="flex justify-between text-xs text-zinc-400">
            <span>{mockTrack.progressTime}</span>
            <span>{mockTrack.duration}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevious}
            className="p-3 rounded-full hover:bg-emerald-500/20 transition-colors text-emerald-400"
          >
            <SkipBack size={24} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPause}
            className="p-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-emerald-500/50"
          >
            {isPlayerPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="p-3 rounded-full hover:bg-emerald-500/20 transition-colors text-emerald-400"
          >
            <SkipForward size={24} />
          </motion.button>
        </div>

        {/* Volume Control */}
        <div className="space-y-3 pt-6 border-t border-emerald-500/20">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-emerald-500/20 transition-colors text-emerald-400"
            >
              {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </motion.button>

            <motion.div className="flex-1 relative group">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-1 bg-zinc-700/50 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="text-xs text-zinc-400 group-hover:text-emerald-400 transition-colors">
                {volume}%
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Subtle Glow Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute top-1/2 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
          animate={{ y: [0, 50, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"
          animate={{ y: [50, 0, 50] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}
