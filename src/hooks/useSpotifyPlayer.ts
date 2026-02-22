import { useEffect } from "react";
import { useSpotifyStore } from "../lib/store/useSpotifyStore";

export const useSpotifyPlayer = (token: string | null) => {
  const { setNowPlaying, setIsPlaying } = useSpotifyStore();

  useEffect(() => {
    // Safety Check: If no token, don't start
    if (!token) return;

    let pollInterval: NodeJS.Timeout;
    let player: any = null;

    // --- APPROACH 1: SPOTIFY WEB PLAYBACK SDK ---
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      try {
        player = new window.Spotify.Player({
          name: 'FlowState.os',
          getOAuthToken: (cb: any) => { cb(token); },
          volume: 0.5
        });

        // Device Ready
        player.addListener('ready', ({ device_id }: any) => {
          console.log('FlowState ready with device:', device_id);
        });

        // Track Changes
        player.addListener('player_state_changed', (state: any) => {
          if (!state) return;

          const track = state.track_window.current_track;
          if (track) {
            setNowPlaying(
              track.name,
              track.artists[0]?.name || "Unknown",
              track.album.images[0]?.url || "",
              !state.paused
            );
            setIsPlaying(!state.paused);
          }
        });

        // Errors
        player.addListener('initialization_error', ({ message }: any) => {
          console.error('Initialization error:', message);
        });

        player.addListener('authentication_error', ({ message }: any) => {
          console.error('Authentication error:', message);
        });

        player.addListener('account_error', ({ message }: any) => {
          console.error('Account error:', message);
        });

        player.connect();
      } catch (err) {
        console.error('Player initialization failed:', err);
      }
    };

    // --- APPROACH 2: POLLING API (Fallback) ---
    const pollCurrentTrack = async () => {
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
        } else {
          setNowPlaying("Not Playing", "Spotify", "", false);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    // Start polling every 2 seconds
    pollInterval = setInterval(pollCurrentTrack, 2000);
    
    // Initial poll
    pollCurrentTrack();

    return () => {
      clearInterval(pollInterval);
      if (player) {
        player.disconnect();
      }
      document.body.removeChild(script);
    };
  }, [token, setNowPlaying, setIsPlaying]);
};

    // Cleanup: Remove script if component dies (optional)
    return () => {
      // Logic to disconnect player if needed
    };
  }, [token, setNowPlaying, setIsPlaying]);
};