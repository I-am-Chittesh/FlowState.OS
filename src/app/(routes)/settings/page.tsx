"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStudyStore } from "../../../lib/store/useStudyStore";
import { supabase } from "../../../lib/supabase"; 
import { Settings, Calendar, Plus, LogOut, Volume2, User, ChevronRight, Trash2, Music, LogIn, LogOut as DisconnectIcon } from "lucide-react";

// Spotify OAuth Config
const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "";
const REDIRECT_URI = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || "http://localhost:3000/spotify/callback";
const SPOTIFY_AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent("streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state")}`;

export default function SettingsPage() {
  const router = useRouter();
  
  const { goals, addGoal, deleteGoal, isSoundOn, toggleSound, fetchData, spotifyToken, setSpotifyToken } = useStudyStore();
  
  const [userEmail, setUserEmail] = useState("Loading...");
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDate, setNewGoalDate] = useState("");
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [spotifyUser, setSpotifyUser] = useState<any>(null);

  // Load Data
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email || "User");
      fetchData();
      setSpotifyConnected(!!spotifyToken);
    };
    init();
  }, [fetchData, spotifyToken]);

  // Handlers
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const handleAddGoal = async () => {
    if (!newGoalTitle || !newGoalDate) return;
    await addGoal(newGoalTitle, new Date(newGoalDate), "#10b981");
    setNewGoalTitle("");
    setNewGoalDate("");
  };

  const handleSpotifyConnect = () => {
    if (!SPOTIFY_CLIENT_ID) {
      alert("Spotify Client ID not configured");
      return;
    }
    window.open(SPOTIFY_AUTH_URL, "Spotify Auth", "width=500,height=700");
  };

  const handleSpotifyDisconnect = () => {
    setSpotifyToken(null);
    setSpotifyConnected(false);
    setSpotifyUser(null);
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-8 pb-24">
      
      {/* Header */}
      <div className="space-y-1 mt-4">
        <h2 className="text-zinc-500 font-medium text-sm uppercase tracking-wider">Configuration</h2>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
      </div>

      {/* User Profile */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
          <User size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate">Active Operator</h3>
          <p className="text-zinc-500 text-xs truncate">{userEmail}</p>
        </div>
      </div>

      {/* SPOTIFY CONNECTION */}
      <div className="space-y-3">
        <h3 className="text-zinc-500 text-xs font-bold uppercase px-1">Music Service</h3>
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1DB954]/20 rounded-full flex items-center justify-center">
                <Music size={20} className="text-[#1DB954]" />
              </div>
              <div>
                <h4 className="text-white text-sm font-medium">Spotify</h4>
                <p className="text-zinc-500 text-xs">{spotifyConnected ? "Connected" : "Not Connected"}</p>
              </div>
            </div>
            {spotifyConnected ? (
              <button 
                onClick={handleSpotifyDisconnect}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-xs font-medium transition-all"
              >
                <DisconnectIcon size={14} />
                Disconnect
              </button>
            ) : (
              <button 
                onClick={handleSpotifyConnect}
                className="flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black px-4 py-2 rounded-lg text-xs font-medium transition-all"
              >
                <LogIn size={14} />
                Connect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* NEW: GOAL MANAGEMENT */}
      <div className="space-y-4">
        <h3 className="text-zinc-500 text-xs font-bold uppercase px-1">Active Goals</h3>
        
        {/* List Existing Goals */}
        <div className="space-y-2">
          {goals.map((goal) => (
            <div key={goal.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
              <div>
                <h4 className="text-white text-sm font-medium">{goal.title}</h4>
                <p className="text-zinc-500 text-xs">{goal.deadline.toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => deleteGoal(goal.id)}
                className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {goals.length === 0 && (
            <p className="text-zinc-600 text-xs text-center py-2">No active goals found.</p>
          )}
        </div>

        {/* Add New Goal Form */}
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 space-y-3">
          <input 
            type="text" 
            placeholder="New Goal Name (e.g., Robotics Final)"
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <div className="flex gap-2">
            <input 
              type="date" 
              value={newGoalDate}
              onChange={(e) => setNewGoalDate(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-white focus:outline-none [color-scheme:dark]"
            />
            <button 
              onClick={handleAddGoal}
              className="bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg px-4 flex items-center justify-center transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="space-y-3">
        <h3 className="text-zinc-500 text-xs font-bold uppercase px-1">System</h3>
        <div onClick={toggleSound} className="flex items-center justify-between bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-xl cursor-pointer">
          <div className="flex items-center gap-3">
            <Volume2 size={18} className="text-indigo-400" />
            <span className="text-zinc-200 text-sm font-medium">Focus Audio</span>
          </div>
          <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isSoundOn ? "bg-emerald-500" : "bg-zinc-700"}`}>
            <div className={`bg-white w-3 h-3 rounded-full transform transition-transform ${isSoundOn ? "translate-x-4" : "translate-x-0"}`} />
          </div>
        </div>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="w-full flex items-center justify-between bg-red-500/5 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm font-medium">
        <div className="flex items-center gap-3"><LogOut size={18} /> Terminate Session</div>
        <ChevronRight size={16} />
      </button>

      {/* Author Note */}
      <div className="text-center pt-4 border-t border-zinc-900/50">
        <p className="text-zinc-600 text-xs">Made for my Pookies❤️</p>
      </div>

    </div>
  );
}