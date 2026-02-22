"use client";

import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, X } from "lucide-react";
import { useSpotifyStore } from "../../../lib/store/useSpotifyStore";
import { useStudyStore } from "../../../lib/store/useStudyStore";

interface SpotifyDeckProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export default function SpotifyDeck({ onClose, isMobile = false }: SpotifyDeckProps) {
  const { isPlaying, trackName, artistName, albumArt, setIsPlaying } = useSpotifyStore();
  const { spotifyToken } = useStudyStore();
  const [volume, setVolume] = useState(70);
  const [loading, setLoading] = useState(false);

  const displayTrack = trackName === "Not Playing" ? "No Track" : trackName;
  const displayArtist = artistName === "Spotify" ? "Play something..." : artistName;
  const displayArt = albumArt || "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=150&auto=format&fit=crop";

  const handlePlayPause = async () => {
    if (!spotifyToken) return;
    setLoading(true);
    try {
      const endpoint = isPlaying 
        ? "https://api.spotify.com/v1/me/player/pause"
        : "https://api.spotify.com/v1/me/player/play";
      
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${spotifyToken}` },
      });

      if (res.status === 401) {
        console.error("Spotify token expired");
        return;
      }

      if (res.ok || res.status === 204) {
        setIsPlaying(!isPlaying);
      } else {
        console.error("Playback error:", res.status, res.statusText);
      }
    } catch (err) {
      console.error("Playback error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async (direction: "next" | "previous") => {
    if (!spotifyToken) return;
    setLoading(true);
    try {
      const endpoint = direction === "next"
        ? "https://api.spotify.com/v1/me/player/next"
        : "https://api.spotify.com/v1/me/player/previous";
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Authorization": `Bearer ${spotifyToken}` },
      });

      if (!res.ok && res.status !== 204) {
        console.error("Skip error:", res.status, res.statusText);
      }
    } catch (err) {
      console.error("Skip error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVolumeChange = async (newVolume: number) => {
    setVolume(newVolume);
    if (!spotifyToken) return;
    
    try {
      const res = await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${newVolume}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${spotifyToken}` },
      });

      if (!res.ok && res.status !== 204) {
        console.error("Volume error:", res.status, res.statusText);
      }
    } catch (err) {
      console.error("Volume error:", err);
    }
  };

  // MOBILE MINI PLAYER
  if (isMobile) {
    return (
      <div className="fixed bottom-32 left-0 right-0 z-50 px-4 pointer-events-auto">
        <div className="bg-gradient-to-br from-zinc-800/90 via-zinc-900/95 to-black/95 backdrop-blur-md border border-zinc-700/40 rounded-3xl p-4 space-y-3 shadow-2xl">
          
          {/* Header with Close Button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-sm line-clamp-1">{displayTrack}</h3>
              <p className="text-zinc-400 text-xs line-clamp-1 mt-0.5">{displayArtist}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all active:scale-90 flex-shrink-0"
              title="Close player"
            >
              <X size={18} />
            </button>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-center gap-1 pt-1">
            <button
              onClick={() => handleSkip("previous")}
              disabled={loading || !spotifyToken}
              className="flex-1 p-3 rounded-2xl text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <SkipBack size={18} fill="currentColor" />
            </button>

            <button
              onClick={handlePlayPause}
              disabled={loading || !spotifyToken}
              className="flex-1 p-3.5 rounded-2xl bg-gradient-to-br from-[#1DB954] to-[#1aa34a] hover:from-[#1ed760] hover:to-[#1db954] text-black transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-[#1DB954]/20 font-semibold"
            >
              {isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" />
              )}
            </button>

            <button
              onClick={() => handleSkip("next")}
              disabled={loading || !spotifyToken}
              className="flex-1 p-3 rounded-2xl text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <SkipForward size={18} fill="currentColor" />
            </button>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isPlaying ? "bg-[#1DB954]" : "bg-zinc-500"}`} />
            <span className="text-[11px] font-medium text-zinc-400">{isPlaying ? "Playing" : "Paused"}</span>
          </div>
        </div>
      </div>
    );
  }

  // DESKTOP FULL PLAYER
  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-sm pointer-events-auto">
      <div className="bg-gradient-to-br from-zinc-900/95 via-black/95 to-zinc-950/95 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-4 space-y-4 shadow-2xl pointer-events-auto">
        
        {/* Album Art */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-lg border border-zinc-800">
            <img 
              src={displayArt} 
              alt="Album art" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </div>

        {/* Song Info */}
        <div className="text-center space-y-1">
          <h3 className="text-white font-bold text-sm line-clamp-1">{displayTrack}</h3>
          <p className="text-zinc-400 text-xs line-clamp-1">{displayArtist}</p>
          <div className="flex items-center justify-center gap-1 pt-1">
            <div className="w-1.5 h-1.5 bg-[#1DB954] rounded-full" />
            <span className="text-[10px] text-zinc-500">{isPlaying ? "Playing" : "Paused"}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 pointer-events-auto">
          <button
            onClick={() => handleSkip("previous")}
            disabled={loading || !spotifyToken}
            className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <SkipBack size={18} fill="currentColor" />
          </button>

          <button
            onClick={handlePlayPause}
            disabled={loading || !spotifyToken}
            className="p-3.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" />
            )}
          </button>

          <button
            onClick={() => handleSkip("next")}
            disabled={loading || !spotifyToken}
            className="p-2.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <SkipForward size={18} fill="currentColor" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="space-y-2 px-1 pointer-events-auto">
          <div className="flex items-center gap-2">
            <Volume2 size={14} className="text-zinc-500" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              disabled={!spotifyToken}
              className="flex-1 h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-[#1DB954] disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="text-[10px] text-zinc-500 w-6 text-right">{volume}%</span>
          </div>
        </div>

        {/* Spotify Badge */}
        {!spotifyToken && (
          <div className="text-center text-xs text-zinc-500 py-2 border-t border-zinc-800/30">
            <p>Not connected to Spotify</p>
            <p className="text-[10px] text-zinc-600">Enable in Settings</p>
          </div>
        )}
      </div>
    </div>
  );
}
