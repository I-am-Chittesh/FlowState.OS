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
      <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-50 w-[88%] max-w-xs pointer-events-auto">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl px-5 py-3 space-y-2 shadow-2xl">
          
          {/* Header Row - Album Art + Info + Close */}
          <div className="flex items-center gap-3">
            {/* Album Art */}
            <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
              <img 
                src={displayArt} 
                alt="Album" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Song Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-xs line-clamp-1">{displayTrack}</h3>
              <p className="text-gray-300 text-[11px] line-clamp-1">{displayArtist}</p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90 flex-shrink-0"
              title="Close player"
            >
              <X size={14} />
            </button>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-center gap-3 pt-0.5">
            <button
              onClick={() => handleSkip("previous")}
              disabled={loading || !spotifyToken}
              className="p-2 rounded-full text-gray-300 hover:text-white transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <SkipBack size={14} fill="currentColor" />
            </button>

            <button
              onClick={handlePlayPause}
              disabled={loading || !spotifyToken}
              className="p-2.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-white transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-[#1DB954]/30"
            >
              {isPlaying ? (
                <Pause size={14} fill="currentColor" />
              ) : (
                <Play size={14} fill="currentColor" />
              )}
            </button>

            <button
              onClick={() => handleSkip("next")}
              disabled={loading || !spotifyToken}
              className="p-2 rounded-full text-gray-300 hover:text-white transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <SkipForward size={14} fill="currentColor" />
            </button>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-1">
            <div className={`w-1 h-1 rounded-full transition-all ${isPlaying ? "bg-[#1DB954] shadow-sm shadow-[#1DB954]/50" : "bg-gray-400"}`} />
            <span className="text-[9px] font-medium text-gray-400">{isPlaying ? "Playing" : "Paused"}</span>
          </div>
        </div>
      </div>
    );
  }

  // DESKTOP RIGHT SIDEBAR PLAYER
  return (
    <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 w-80 pointer-events-auto max-h-[90vh] overflow-y-auto">
      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl px-6 py-5 space-y-5 shadow-2xl">
        
        {/* Album Art */}
        <div className="flex justify-center">
          <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-xl border border-white/20">
            <img 
              src={displayArt} 
              alt="Album art" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Song Info */}
        <div className="space-y-3 text-center">
          <div className="space-y-2">
            <h3 className="text-white font-bold text-lg line-clamp-2">{displayTrack}</h3>
            <p className="text-gray-300 text-sm">{displayArtist}</p>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full transition-all ${isPlaying ? "bg-[#1DB954] shadow-md shadow-[#1DB954]/60" : "bg-gray-400"}`} />
            <span className="text-xs font-medium text-gray-400">{isPlaying ? "Now Playing" : "Paused"}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handleSkip("previous")}
            disabled={loading || !spotifyToken}
            className="p-3 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Previous track"
          >
            <SkipBack size={20} fill="currentColor" />
          </button>

          <button
            onClick={handlePlayPause}
            disabled={loading || !spotifyToken}
            className="p-4 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-white transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-[#1DB954]/40"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={22} fill="currentColor" />
            ) : (
              <Play size={22} fill="currentColor" />
            )}
          </button>

          <button
            onClick={() => handleSkip("next")}
            disabled={loading || !spotifyToken}
            className="p-3 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-all active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Next track"
          >
            <SkipForward size={20} fill="currentColor" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Volume2 size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              disabled={!spotifyToken}
              className="flex-1 h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#1DB954] disabled:opacity-40 disabled:cursor-not-allowed"
              title="Volume"
            />
            <span className="text-xs font-medium text-gray-400 w-8 text-right">{volume}%</span>
          </div>
        </div>

        {/* Connection Status */}
        {!spotifyToken && (
          <div className="text-center py-3 border-t border-white/10 space-y-2">
            <p className="text-xs text-gray-400">Not Connected</p>
            <p className="text-[11px] text-gray-500">Enable in Settings</p>
          </div>
        )}

        {spotifyToken && (
          <div className="text-center py-2 border-t border-white/10">
            <p className="text-[11px] text-gray-500">Connected to Spotify</p>
          </div>
        )}
      </div>
    </div>
  );
}
