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

export interface Reminder {
  id: string;
  user_id: string;
  task_id: string;
  reminder_time: Date;
  is_sent: boolean;
  created_at: Date;
  updated_at: Date;
}

export {};
