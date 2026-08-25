import "./Studio.css";

const PEOPLE = [
  {
    id: "01",
    name: "Pattern",
    body: "The silhouette is solved on the table — grain, ease, construction — before a line is set.",
  },
  {
    id: "02",
    name: "Sample",
    body: "Toiles, comments and revisions happen in the open. Trust is built in the sample room.",
  },
  {
    id: "03",
    name: "Production",
    body: "Cut, sew and finish around the approved sample. Quantity does not change the standard.",
  },
  {
    id: "04",
    name: "Quality",
    body: "Measure, press and inspect against what was signed off. Finishing is part of the product.",
  },
];

export default function People() {
  return (
    <>
      <header className="page-head">
        <div className="container">
          <p className="eyebrow">People</p>
          <h1>The hands behind the work.</h1>
          <p className="page-head__lede">
            A small studio, organised around the path a product actually takes. Roles overlap. The project does not get handed off.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <ol className="studio-list">
            {PEOPLE.map((p) => (
              <li key={p.id}>
                <p className="eyebrow">{p.id}</p>
                <div>
                  <h2>{p.name}</h2>
                  <p>{p.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
