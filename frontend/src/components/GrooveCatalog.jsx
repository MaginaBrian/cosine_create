import { GROOVE_CATEGORIES, getLook } from "../data";
import "./GrooveCatalog.css";

export default function GrooveCatalog() {
  return (
    <section className="groove-catalog" aria-label="Groove Hangout catalogue">
      <div className="container">
        <div className="groove-catalog__intro">
          <p className="eyebrow">The Groove Hangout</p>
          <h2>7th edition.</h2>
          <p>Oversized T-shirts, crop turn-ups, hats and tags.</p>
        </div>
        <ul className="groove-catalog__stack">
          {GROOVE_CATEGORIES.map((category) => {
            const data = getLook("the-groove-hangout", null, category.id);
            const cover = data?.look?.cover;
            const hasLookbook = Boolean(cover || data?.look?.items?.length);
            const inner = (
              <>
                <h3>{category.label}</h3>
                {cover ? (
                  <div
                    className={`groove-catalog__frame${
                      category.id === "hats" || category.id === "tags"
                        ? ` groove-catalog__frame--${category.id}`
                        : ""
                    }`}
                  >
                    <img src={cover} alt="" />
                  </div>
                ) : (
                  <div className="groove-catalog__frame" />
                )}
              </>
            );
            return (
              <li key={category.id}>
                {hasLookbook ? (
                  <a
                    href={`#/work/the-groove-hangout/${category.id}`}
                    className="groove-catalog__item"
                    aria-label={category.label}
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="groove-catalog__item groove-catalog__item--soon" aria-label={category.label}>
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
