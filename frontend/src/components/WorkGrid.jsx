import { prefetchPath } from "../loadPage";
import "./WorkGrid.css";

export default function WorkGrid({ projects }) {
  return (
    <div className="work-grid">
      {projects.map((p, i) => {
        const href = `#/work/${p.slug}`;
        return (
          <a
            href={href}
            className={`work-card${p.image ? "" : " work-card--text"}`}
            key={p.slug}
            aria-label={`${p.cardTitle || p.client} — ${p.name}`}
            onMouseEnter={() => prefetchPath(href)}
            onFocus={() => prefetchPath(href)}
          >
            {p.image ? (
              <img
                src={p.image}
                alt=""
                className={p.imageFit === "portrait" ? "is-portrait" : undefined}
                loading={i < 2 ? "eager" : "lazy"}
                decoding="async"
              />
            ) : null}
            <span className="work-card__name">{p.cardTitle || p.client}</span>
          </a>
        );
      })}
    </div>
  );
}
