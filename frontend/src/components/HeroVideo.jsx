import { useEffect, useRef, useState } from "react";
import "./HeroVideo.css";

export default function HeroVideo() {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const play = () => {
      if (reduce.matches) {
        video.pause();
        return;
      }
      video.muted = false;
      video.play().then(() => {
        setMuted(false);
      }).catch(() => {
        video.muted = true;
        setMuted(true);
        video.play().catch(() => {});
      });
    };

    play();
    reduce.addEventListener("change", play);
    return () => reduce.removeEventListener("change", play);
  }, []);

  const setSound = (nextMuted) => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = nextMuted;
    setMuted(nextMuted);
    if (!nextMuted) video.play().catch(() => {});
  };

  return (
    <section className="reel" id="top" aria-label="Studio film">
      <video
        ref={videoRef}
        className="reel__video"
        src="/videos/hero.mp4?v=2"
        autoPlay
        loop
        playsInline
        preload="auto"
        onClick={() => {
          if (muted) setSound(false);
        }}
      />

      <button
        type="button"
        className="reel__sound"
        aria-label={muted ? "Unmute film" : "Mute film"}
        onClick={() => setSound(!muted)}
      >
        {muted ? (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <path d="M3 8.5h3.2L11 4.8v12.4L6.2 13.5H3V8.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="m14.2 8.3 4.5 5.4M18.7 8.3l-4.5 5.4" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <path d="M3 8.5h3.2L11 4.8v12.4L6.2 13.5H3V8.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M14.2 8.2a4.4 4.4 0 0 1 0 5.6M16.6 6.2a7.4 7.4 0 0 1 0 9.6" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        )}
      </button>

      <a
        className="reel__scroll"
        href="#work"
        aria-label="Scroll to work"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M4 8.5 11 15.5 18 8.5" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </a>
    </section>
  );
}
