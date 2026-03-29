"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useSpotifyStore } from "../../../lib/store/useSpotifyStore";

interface SpotifyPlayerDesktopProps {
  isPlaying?: boolean;
  onPlayPause?: () => void;
}

export default function SpotifyPlayerDesktop({ isPlaying = false, onPlayPause }: SpotifyPlayerDesktopProps) {
  const { trackName, artistName, albumArt, isPlaying: storeIsPlaying, setIsPlaying } = useSpotifyStore();
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(45);
  const [progressTime, setProgressTime] = useState("0:00");
  const [duration, setDuration] = useState("3:45");

  useEffect(() => {
    // Poll for progress and duration updates
    const pollProgress = async () => {
      try {
        const token = localStorage.getItem('spotify_token');
        if (!token) return;

        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.item) {
            const currentMs = data.progress_ms || 0;
            const durationMs = data.item.duration_ms || 0;
            setProgress((currentMs / durationMs) * 100 || 0);
            setProgressTime(formatTime(currentMs));
            setDuration(formatTime(durationMs));
          }
        }
      } catch (err) {
        console.debug('Progress poll error:', err);
      }
    };

    const interval = setInterval(pollProgress, 1000);
    pollProgress();
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    const token = localStorage.getItem('spotify_token');
    if (!token) return;

    try {
      const endpoint = storeIsPlaying 
        ? 'https://api.spotify.com/v1/me/player/pause'
        : 'https://api.spotify.com/v1/me/player/play';

      await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setIsPlaying(!storeIsPlaying);
      onPlayPause?.();
    } catch (err) {
      console.error('Playback control error:', err);
    }
  };

  const handlePrevious = async () => {
    const token = localStorage.getItem('spotify_token');
    if (!token) return;

    try {
      await fetch('https://api.spotify.com/v1/me/player/previous', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Previous track error:', err);
    }
  };

  const handleNext = async () => {
    const token = localStorage.getItem('spotify_token');
    if (!token) return;

    try {
      await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Next track error:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col items-center justify-center p-6 gap-8"
    >
      {/* Glassmorphic Player Card - Liquid Glass Effect */}
      <motion.div
        className="w-full max-w-2xl backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-10 shadow-2xl"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Album Art Container */}
        <motion.div
          className="relative w-full aspect-square mb-8 rounded-2xl overflow-hidden backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg"
          whileHover={{ scale: 1.02 }}
        >
          {albumArt ? (
            <img src={albumArt} alt={trackName} className="w-full h-full object-cover" />
          ) : (
            <>
              <motion.div
                className="absolute inset-0 bg-black/20"
                animate={storeIsPlaying ? { opacity: [0.2, 0.4, 0.2] } : { opacity: 0.2 }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
                🎵
              </div>
            </>
          )}

          {/* Rotating Border Effect */}
          {storeIsPlaying && (
            <motion.div
              className="absolute inset-0 border-2 border-transparent border-t-white border-r-white/50 rounded-2xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.div>

        {/* Track Info */}
        <div className="text-center mb-8 space-y-2">
          <h3 className="text-white font-bold text-xl line-clamp-2">{trackName || "Not Playing"}</h3>
          <p className="text-white/70 text-sm font-medium">{artistName || "Spotify"}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 space-y-2">
          <motion.div
            className="h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur"
            whileHover={{ height: 4 }}
          >
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
          <div className="flex justify-between text-xs text-white/60">
            <span>{progressTime}</span>
            <span>{duration}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrevious}
            className="p-3 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white"
          >
            <SkipBack size={24} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPause}
            className="p-4 rounded-full backdrop-blur-md bg-white/30 border border-white/40 text-white shadow-lg hover:bg-white/40 transition-colors"
          >
            {storeIsPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="p-3 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white"
          >
            <SkipForward size={24} />
          </motion.button>
        </div>

        {/* Volume Control */}
        <div className="space-y-3 pt-6 border-t border-white/20">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white"
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
                className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
              />
              <div className="text-xs text-white/60 group-hover:text-white transition-colors">
                {volume}%
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Subtle Glow Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute top-1/2 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl\"
          animate={{ y: [0, 50, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          animate={{ y: [50, 0, 50] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}
