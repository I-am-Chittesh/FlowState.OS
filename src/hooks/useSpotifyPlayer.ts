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

    // Load and setup Spotify SDK
    try {
      script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);

      (window as any).onSpotifyWebPlaybackSDKReady = () => {
        try {
          player = new (window as any).Spotify.Player({
            name: 'FlowState.os',
            getOAuthToken: (cb: any) => { cb(token); },
            volume: 0.5
          });

          player.addListener('ready', ({ device_id }: any) => {
            console.log('FlowState ready with device:', device_id);
          });

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

          player.addListener('initialization_error', ({ message }: any) => {
            console.error('Spotify init error:', message);
          });

          player.addListener('authentication_error', ({ message }: any) => {
            console.error('Spotify auth error:', message);
          });

          player.addListener('account_error', ({ message }: any) => {
            console.error('Spotify account error:', message);
          });

          player.connect();
        } catch (err) {
          console.error('Failed to initialize Spotify player:', err);
        }
      };
    } catch (err) {
      console.error('Failed to load Spotify SDK:', err);
    }

    // Fallback: Poll for current track every 2 seconds
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

    pollInterval = setInterval(pollCurrentTrack, 2000);
    pollCurrentTrack();

    // Cleanup
    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (player) {
        try {
          player.disconnect();
        } catch (e) {
          // Ignore
        }
      }
      if (script?.parentNode) {
        try {
          script.parentNode.removeChild(script);
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [token, setNowPlaying, setIsPlaying]);
};