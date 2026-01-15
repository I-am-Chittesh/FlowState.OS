import { useEffect } from "react";
import { useSpotifyStore } from "../lib/store/useSpotifyStore";

export const useSpotifyPlayer = (token: string | null) => {
  const { setNowPlaying, setIsPlaying } = useSpotifyStore();

  useEffect(() => {
    // 0. Safety Check: If no token, don't start the engine
    if (!token) return;

    // 1. Inject the Spotify Script
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    // 2. Initialize the Player
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'FlowState.os',
        getOAuthToken: (cb) => { cb(token); },
        volume: 0.5
      });

      // 3. Listener: Device Ready
      player.addListener('ready', ({ device_id }) => {
        console.log('FlowState is Online with Device ID:', device_id);
      });

      // 4. Listener: The Music Changed!
      player.addListener('player_state_changed', (state) => {
        if (!state) return;

        // Extract the data we need
        const track = state.track_window.current_track;
        const isPaused = state.paused;

        // Update the Brain (Store)
        setNowPlaying(
          track.name,
          track.artists[0].name,
          track.album.images[0].url,
          !isPaused
        );
      });

      // 5. Connect
      player.connect();
    };

    // Cleanup: Remove script if component dies (optional)
    return () => {
      // Logic to disconnect player if needed
    };
  }, [token, setNowPlaying, setIsPlaying]);
};