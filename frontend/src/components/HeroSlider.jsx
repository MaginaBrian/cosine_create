import { useEffect, useState } from "react";
import { SLIDES } from "../data";
import "./HeroSlider.css";

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || paused) return undefined;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, [paused]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % SLIDES.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section
      className="reel"
      id="top"
      aria-roledescription="carousel"
      aria-label="Selected work"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="reel__slides">
        {SLIDES.map((slide, i) => (
          <figure
            key={slide.src}
            className={`reel__slide ${i === index ? "is-active" : ""}`}
            aria-hidden={i !== index}
          >
            <img src={slide.src} alt={i === index ? slide.alt : ""} />
          </figure>
        ))}
      </div>

      <div className="reel__dots" role="tablist" aria-label="Slides">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show ${slide.alt}`}
            className={i === index ? "is-active" : ""}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>

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
