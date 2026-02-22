import { useEffect } from "react";
import { useSpotifyStore } from "../lib/store/useSpotifyStore";

export const useSpotifyPlayer = (token: string | null) => {
  const { setNowPlaying, setIsPlaying } = useSpotifyStore();

  useEffect(() => {
    // Safety: Don't run on server or without token
    if (!token || typeof window === 'undefined' || typeof document === 'undefined') return;

    let pollInterval: NodeJS.Timeout | undefined;
    let player: any = null;
    let script: HTMLScriptElement | null = null;

    // Load Spotify SDK
    const loadSpotifySDK = () => {
      if ((window as any).Spotify && (window as any).Spotify.Player) {
        initializePlayer();
        return;
      }

      script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      script.onload = () => {
        console.log("Spotify SDK loaded");
      };
      document.body.appendChild(script);

      // SDK will call this when ready
      (window as any).onSpotifyWebPlaybackSDKReady = initializePlayer;
    };

    const initializePlayer = () => {
      try {
        const SpotifyPlayer = (window as any).Spotify?.Player;
        if (!SpotifyPlayer) {
          console.error("Spotify Player class not found");
          return;
        }

        player = new SpotifyPlayer({
          name: 'FlowState.OS',
          getOAuthToken: (cb: any) => { cb(token); },
          volume: 0.5
        });

        // Device ready
        player.addListener('ready', ({ device_id }: any) => {
          console.log('FlowState device ready:', device_id);
          // Transfer playback to this device
          transferPlaybackToDevice(device_id);
        });

        // Listen for state changes
        player.addListener('player_state_changed', (state: any) => {
          if (!state) return;
          
          const track = state.track_window?.current_track;
          if (track) {
            setNowPlaying(
              track.name,
              track.artists[0]?.name || "Unknown",
              track.album?.images?.[0]?.url || "",
              !state.paused
            );
            setIsPlaying(!state.paused);
          }
        });

        // Error handlers
        player.addListener('initialization_error', ({ message }: any) => {
          console.error('Spotify init error:', message);
        });

        player.addListener('authentication_error', ({ message }: any) => {
          console.error('Spotify auth error:', message);
        });

        player.addListener('account_error', ({ message }: any) => {
          console.error('Spotify account error:', message);
        });

        player.addListener('playback_error', ({ message }: any) => {
          console.error('Spotify playback error:', message);
        });

        // Connect to Spotify
        player.connect();
      } catch (err) {
        console.error('Failed to initialize Spotify player:', err);
      }
    };

    const transferPlaybackToDevice = async (deviceId: string) => {
      if (!token) return;
      try {
        await fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            device_ids: [deviceId],
            play: false // Don't auto-play, let user click
          })
        });
        console.log('Playback transferred to FlowState device');
      } catch (err) {
        console.error('Failed to transfer playback:', err);
      }
    };

    // Poll for current track to sync state (even if not using Web Playback SDK)
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

    // Start SDK and polling
    loadSpotifySDK();
    pollInterval = setInterval(pollCurrentTrack, 1000); // Poll every second for sync
    pollCurrentTrack();

    // Cleanup
    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (player) {
        try {
          player.disconnect();
        } catch (err) {
          console.error('Error disconnecting player:', err);
        }
      }
      if (script && script.parentNode) {
        try {
          script.parentNode.removeChild(script);
        } catch (err) {
          console.error('Error removing script:', err);
        }
      }
    };
  }, [token, setNowPlaying, setIsPlaying]);
};