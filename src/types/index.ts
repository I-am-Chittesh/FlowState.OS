declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: (() => void) | undefined;
    spotifyToken?: string;
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
