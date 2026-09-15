import { GROOVE_CATEGORIES, getLook } from "../data";
import "./GrooveCatalog.css";

export default function GrooveCatalog({ owner = false }) {
  return (
    <section className="groove-catalog" aria-label="Groove Hangout catalogue">
      <div className="container">
        <div className="groove-catalog__intro">
          <p className="eyebrow">The Groove Hangout</p>
          <h2>7th edition.</h2>
          <p>
            {owner
              ? "Open a product for the looks. Orders are placed on the form above, or on the product page."
              : "Oversized T-shirts, crop tops and hats. Open a product for the looks."}
          </p>
        </div>
        <ul className="groove-catalog__grid">
          {GROOVE_CATEGORIES.map((category) => {
            const data = getLook("the-groove-hangout", null, category.id);
            const cover = data?.look?.cover;
            const hasLookbook = Boolean(cover || data?.look?.items?.length);
            const inner = (
              <>
                {cover ? <img src={cover} alt="" /> : <span className="groove-catalog__frame" />}
                <b>{category.label}</b>
              </>
            );
            return (
              <li key={category.id}>
                {hasLookbook ? (
                  <a
                    href={`#/work/the-groove-hangout/${category.id}`}
                    className={`groove-catalog__card${category.id === "hats" ? " groove-catalog__card--hats" : ""}`}
                    aria-label={category.label}
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="groove-catalog__card groove-catalog__card--soon" aria-label={category.label}>
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
