import { CLOTHING_CATEGORIES, SHARED_CATEGORIES, getProject } from "../data";
import { isBrandOwner } from "../clientHome";
import OrderPanel from "../components/OrderPanel";
import "./Project.css";

function Category({ slug, gender, category, look, hideTitle }) {
  const cover = look?.cover;
  const hasLookbook = Boolean(cover || look?.items?.length);
  const href = gender
    ? `#/work/${slug}/${gender}/${category.id}`
    : `#/work/${slug}/${category.id}`;
  const inner = (
    <>
      {hideTitle ? null : <h3>{category.label}</h3>}
      {cover ? (
        <div className="project-looks__frame">
          <img src={cover} alt="" />
        </div>
      ) : (
        <div className="project-looks__frame" />
      )}
    </>
  );

  if (!hasLookbook) {
    return (
      <section className="project-cat" aria-label={category.label}>
        {inner}
      </section>
    );
  }

  return (
    <a href={href} className="project-cat project-cat--link" aria-label={category.label}>
      {inner}
    </a>
  );
}

function LookColumn({ slug, gender, label, looks }) {
  return (
    <div className="project-looks__col">
      <h2>{label}</h2>
      {CLOTHING_CATEGORIES.map((category) => (
        <Category
          key={category.id}
          slug={slug}
          gender={gender}
          category={category}
          look={looks?.[category.id]}
        />
      ))}
    </div>
  );
}

export default function Project({ slug, user }) {
  const project = getProject(slug);

  if (!project) {
    return (
      <header className="project-hero">
        <h1>Not found</h1>
        <p className="project-hero__hook">That project is not in the work yet.</p>
        <p className="project-hero__credit">
          <a href="#/">Back to work</a>
        </p>
      </header>
    );
  }

  const looks = project.looks || {};
  const credit = project.credit || `Work done for ${project.client}`;

  return (
    <article className="project">
      <header className={`project-hero${project.hero ? " project-hero--photo" : ""}`}>
        {project.hero ? (
          <img className="project-hero__bg" src={project.hero} alt="" />
        ) : null}
        <div className="project-hero__copy">
          <h1>{project.client}</h1>
          {project.hook ? <p className="project-hero__hook">{project.hook}</p> : null}
          {project.gallery ? (
            <p className="project-hero__credit">
              <a href={project.gallery} target="_blank" rel="noreferrer">
                {credit}
              </a>
            </p>
          ) : (
            <p className="project-hero__credit">{credit}</p>
          )}
        </div>
      </header>

      <section className="project-looks" aria-label="Looks">
        <LookColumn slug={slug} gender="men" label="Men" looks={looks.men} />
        <LookColumn slug={slug} gender="women" label="Women" looks={looks.women} />
      </section>

      <section className="project-looks" aria-label="Hoodies and sweatshirts">
        {SHARED_CATEGORIES.map((category) => (
          <div key={category.id} className="project-looks__col">
            <h2>{category.label}</h2>
            <Category
              slug={slug}
              category={category}
              look={looks.shared?.[category.id]}
              hideTitle
            />
          </div>
        ))}
      </section>

      {isBrandOwner(user, slug) ? <OrderPanel user={user} slug={slug} /> : null}
    </article>
  );
}
