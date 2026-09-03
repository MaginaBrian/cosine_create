import "./WorkGrid.css";

export default function WorkGrid({ projects }) {
  return (
    <div className="work-grid">
      {projects.map((p) => (
        <a
          href={`#/work/${p.slug}`}
          className={`work-card${p.image ? "" : " work-card--text"}`}
          key={p.slug}
          aria-label={`${p.cardTitle || p.client} — ${p.name}`}
        >
          {p.image ? (
            <img
              src={p.image}
              alt=""
              className={p.imageFit === "portrait" ? "is-portrait" : undefined}
            />
          ) : null}
          <span className="work-card__name">{p.cardTitle || p.client}</span>
        </a>
      ))}
    </div>
  );
}
