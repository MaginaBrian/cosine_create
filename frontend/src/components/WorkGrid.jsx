import "./WorkGrid.css";

export default function WorkGrid({ projects }) {
  return (
    <div className="work-grid">
      {projects.map((p) => (
        <a href="#/work" className="work-card" key={p.name}>
          <img src={p.image} alt={`${p.client} — ${p.name}`} />
          <span className="work-card__name">{p.client}</span>
        </a>
      ))}
    </div>
  );
}
