import { useEffect } from "react";
import { useSpotifyStore } from "../lib/store/useSpotifyStore";

export const useSpotifyPlayer = (token: string | null) => {
  const { setNowPlaying, setIsPlaying } = useSpotifyStore();

  useEffect(() => {
    // Safety: Don't run on server or without token
    if (!token || typeof window === 'undefined' || typeof document === 'undefined') return;

    let pollInterval: NodeJS.Timeout | undefined;

    // Poll for current track to sync state
    const pollCurrentTrack = async () => {
      if (!token) return;
      try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 204 || !response.ok) {
          setNowPlaying("Not Playing", "Spotify", "", false);
          return;
        }

        const data = await response.json();
        if (data && data.item) {
          setNowPlaying(
            data.item.name,
            data.item.artists[0]?.name || "Unknown",
            data.item.album?.images?.[0]?.url || "",
            data.is_playing || false
          );
          setIsPlaying(data.is_playing || false);
        }
      } catch (err) {
        console.debug('Spotify poll error:', err);
      }
    };

    // Start polling every 1 second for real-time sync
    pollInterval = setInterval(pollCurrentTrack, 1000);
    pollCurrentTrack();

    // Cleanup
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [token, setNowPlaying, setIsPlaying]);
};
