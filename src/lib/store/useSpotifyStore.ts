import { create } from 'zustand';

interface SpotifyState {
  // 1. The Data (What we need to show)
  isPlaying: boolean;
  trackName: string;
  artistName: string;
  albumArt: string;
  
  // 2. The Actions (How we change it)
  // Used when we fetch new data from Spotify
  setNowPlaying: (track: string, artist: string, art: string, playing: boolean) => void;
  
  // Used for instant feedback when you click "Pause"
  setIsPlaying: (playing: boolean) => void;
}

export const useSpotifyStore = create<SpotifyState>((set) => ({
  // --- Initial Defaults ---
  isPlaying: false,
  trackName: "Not Playing",
  artistName: "Spotify",
  albumArt: "", // Empty string = use default placeholder

  // --- Actions ---
  setNowPlaying: (track, artist, art, playing) => set({
    trackName: track,
    artistName: artist,
    albumArt: art,
    isPlaying: playing
  }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),
}));