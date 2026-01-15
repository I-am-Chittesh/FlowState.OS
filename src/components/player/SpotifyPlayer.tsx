"use client";

import { Play, Pause, SkipForward, SkipBack, Music2, LogIn } from "lucide-react";
import { useSpotifyStore } from "../../lib/store/useSpotifyStore";
import { useStudyStore } from "../../lib/store/useStudyStore";

// --- CONFIG ---
const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || ""; 
const REDIRECT_URI = "http://localhost:3000/callback"; 
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state";

const LOGIN_URL = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPES)}`;

export default function SpotifyPlayer() {
  const { spotifyToken } = useStudyStore();
  const { isPlaying, trackName, artistName, albumArt, setIsPlaying } = useSpotifyStore();

  // FALLBACKS
  const displayTrack = trackName === "Not Playing" ? "FlowState Radio" : trackName;
  const displayArtist = artistName === "Spotify" ? "Ready to Focus" : artistName;
  const displayArt = albumArt || "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=100&auto=format&fit=crop"; 

  // --- STATE 1: NOT CONNECTED (Show Login Button) ---
  if (!spotifyToken) {
    return (
      // FIX: Added 'left-0 right-0 mx-auto' to center the absolute element
      <div className="absolute bottom-24 left-0 right-0 mx-auto z-30 w-full max-w-[320px] px-4">
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-[#1DB954]/20 rounded-full shrink-0">
              <Music2 size={18} className="text-[#1DB954]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-white text-xs font-bold truncate">Spotify Connect</h4>
              <p className="text-zinc-400 text-[10px] truncate">Control music from here</p>
            </div>
          </div>
          
          {CLIENT_ID ? (
            <a 
              href={LOGIN_URL}
              className="bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold px-4 py-2 rounded-full transition-colors flex items-center gap-2 shrink-0"
            >
              <LogIn size={14} />
              Login
            </a>
          ) : (
            <button 
              disabled 
              className="bg-zinc-700 text-zinc-400 text-[10px] font-bold px-3 py-2 rounded-full cursor-not-allowed shrink-0"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- STATE 2: CONNECTED (The Player) ---
  return (
    // FIX: Added 'left-0 right-0 mx-auto' here as well
    <div className="absolute bottom-24 left-0 right-0 mx-auto z-30 w-full max-w-[320px] px-4">
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl flex items-center gap-3 transition-all hover:bg-black/70 group">
        
        {/* Album Art */}
        <div className={`relative w-12 h-12 shrink-0 rounded-md overflow-hidden shadow-lg ${isPlaying ? "animate-spin-slow" : ""}`}>
           <img src={displayArt} alt="Art" className="w-full h-full object-cover" />
           <div className="absolute bottom-0 right-0 bg-black p-0.5 rounded-tl-md">
             <Music2 size={8} className="text-[#1DB954]" />
           </div>
        </div>

        {/* Info & Controls */}
        <div className="flex-1 min-w-0">
          <div className="mb-1">
            <h4 className="text-white text-xs font-bold truncate">{displayTrack}</h4>
            <p className="text-zinc-400 text-[10px] truncate">{displayArtist}</p>
          </div>

          <div className="flex items-center justify-between px-1">
            <button className="text-zinc-400 hover:text-white transition-colors"><SkipBack size={16} fill="currentColor" /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:scale-110 transition-transform">
              <div className="bg-white text-black rounded-full p-1.5">
                 {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
              </div>
            </button>
            <button className="text-zinc-400 hover:text-white transition-colors"><SkipForward size={16} fill="currentColor" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}