import { useState } from "react";
import "./ProductSlide.css";

export default function ProductSlide({ front, back, alt }) {
  const [flipped, setFlipped] = useState(false);

  if (!back) {
    return (
      <figure className="product-slide product-slide--still">
        <img src={front} alt={alt} className="product-slide__front" />
      </figure>
    );
  }

  return (
    <figure
      className={`product-slide${flipped ? " is-flipped" : ""}`}
      onClick={() => setFlipped((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped((v) => !v);
        }
      }}
      tabIndex={0}
      aria-label={`${alt}. Hover or tap to see the back.`}
    >
      <img src={front} alt={alt} className="product-slide__front" />
      <img src={back} alt="" className="product-slide__back" />
    </figure>
  );
}
