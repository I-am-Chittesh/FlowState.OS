declare global {
  interface Window {
    spotifyAuthWindow?: Window;
  }
}

export interface SpotifyPlaybackState {
  track_window: {
    current_track: {
      name: string;
      artists: Array<{ name: string }>;
      album: {
        images: Array<{ url: string }>;
      };
    };
  };
  paused: boolean;
}

export {};
