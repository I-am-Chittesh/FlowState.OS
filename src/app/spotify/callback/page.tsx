"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStudyStore } from "../../../lib/store/useStudyStore";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSpotifyToken } = useStudyStore();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        console.error("Spotify auth error:", error);
        window.close();
        return;
      }

      if (code) {
        try {
          // Exchange the code for an access token
          const response = await fetch("/api/spotify/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });

          const data = await response.json();
          
          if (data.access_token) {
            // Store token in Zustand store
            setSpotifyToken(data.access_token);
            // Also save to localStorage for persistence
            localStorage.setItem("spotify_token", data.access_token);
            if (data.refresh_token) {
              localStorage.setItem("spotify_refresh_token", data.refresh_token);
            }
          }
        } catch (err) {
          console.error("Failed to exchange code:", err);
        }
      }

      // Close the popup window and notify parent
      window.close();
    };

    handleCallback();
  }, [searchParams, setSpotifyToken]);

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin mx-auto" />
        <h1 className="text-lg font-semibold">Connecting Spotify...</h1>
        <p className="text-zinc-500 text-sm">This window will close automatically</p>
      </div>
    </div>
  );
}

export default function SpotifyCallbackPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin mx-auto" />
          <h1 className="text-lg font-semibold">Loading...</h1>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
