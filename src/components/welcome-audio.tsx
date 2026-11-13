"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "nextLevelWelcomePlayed";

export function WelcomeAudio({ enabled }: { enabled: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showFallback, setShowFallback] = useState(false);
  useEffect(() => {
    if (!enabled || sessionStorage.getItem(STORAGE_KEY) === "true") return;
    const audio = audioRef.current;
    if (!audio) return;
    const playback = audio.play();
    if (!playback) { setShowFallback(true); return; }
    void playback.then(() => sessionStorage.setItem(STORAGE_KEY, "true")).catch(() => setShowFallback(true));
  }, [enabled]);
  if (!enabled) return null;
  async function playWelcome() {
    await audioRef.current?.play();
    sessionStorage.setItem(STORAGE_KEY, "true");
    setShowFallback(false);
  }
  return <><audio ref={audioRef} src="/media/level-completed-welcome.mp3" preload="auto" />{showFallback ? <button aria-label="Play welcome audio" className="welcomeAudioButton" type="button" onClick={() => void playWelcome()}>▶ Play welcome audio</button> : null}</>;
}
