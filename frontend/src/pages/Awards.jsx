import "./Studio.css";

const AWARDS = [
  {
    id: "01",
    name: "Making, shown",
    body: "Selected for studio showcases that put process — cutting, sampling, finishing — in front of the finished piece.",
  },
  {
    id: "02",
    name: "Small-run manufacturing",
    body: "Recognised for holding a first sample and a production run to the same standard, without inflating minimums.",
  },
  {
    id: "03",
    name: "Material intent",
    body: "Noted for sourcing as a design decision: hand, weight and origin chosen with the product, not from a stock list.",
  },
];

export default function Awards() {
  return (
    <>
      <header className="page-head">
        <div className="container">
          <p className="eyebrow">Awards</p>
          <h1>Recognition for the work.</h1>
          <p className="page-head__lede">
            We measure the studio by the making — not the noise around it. These are the moments the work was asked to stand in public.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <ol className="studio-list">
            {AWARDS.map((a) => (
              <li key={a.id}>
                <p className="eyebrow">{a.id}</p>
                <div>
                  <h2>{a.name}</h2>
                  <p>{a.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
