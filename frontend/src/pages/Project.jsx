import { useEffect, useRef, useState } from "react";
import { CLOTHING_CATEGORIES, SHARED_CATEGORIES, getProject } from "../data";
import { canViewTextiles, isBrandOwner } from "../clientHome";
import { fetchFabrics } from "../api";
import OrderPanel from "../components/OrderPanel";
import FabricOrderPanel from "../components/FabricOrderPanel";
import TextilesCatalog from "../components/TextilesCatalog";
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

function HeroBackground({ image, video }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const play = () => {
      if (reduce.matches) {
        el.pause();
        return;
      }
      el.muted = false;
      el.play().then(() => {
        setMuted(false);
      }).catch(() => {
        el.muted = true;
        setMuted(true);
        el.play().catch(() => {});
      });
    };

    play();
    reduce.addEventListener("change", play);
    return () => reduce.removeEventListener("change", play);
  }, [video]);

  const setSound = (nextMuted) => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = nextMuted;
    setMuted(nextMuted);
    if (!nextMuted) el.play().catch(() => {});
  };

  if (video) {
    return (
      <>
        <video
          ref={videoRef}
          className="project-hero__bg project-hero__bg--video"
          src={video}
          autoPlay
          loop
          playsInline
          preload="auto"
        />
        <button
          type="button"
          className="project-hero__sound"
          aria-label={muted ? "Unmute film" : "Mute film"}
          onClick={() => setSound(!muted)}
        >
          {muted ? (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M3 8.5h3.2L11 4.8v12.4L6.2 13.5H3V8.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="m14.2 8.3 4.5 5.4M18.7 8.3l-4.5 5.4" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M3 8.5h3.2L11 4.8v12.4L6.2 13.5H3V8.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M14.2 8.2a4.4 4.4 0 0 1 0 5.6M16.6 6.2a7.4 7.4 0 0 1 0 9.6" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          )}
        </button>
      </>
    );
  }

  if (image) {
    return <img className="project-hero__bg" src={image} alt="" />;
  }

  return null;
}

export default function Project({ slug, user }) {
  const project = getProject(slug);
  const textilesAccess = slug === "cosine-textiles" && canViewTextiles(user);
  const [fabrics, setFabrics] = useState([]);
  const [fabricError, setFabricError] = useState("");
  const [selectedFabric, setSelectedFabric] = useState(null);

  useEffect(() => {
    if (!textilesAccess) return;
    fetchFabrics()
      .then((data) => setFabrics(data.fabrics || []))
      .catch((err) => setFabricError(err.message || "Could not load the mill list"));
  }, [textilesAccess]);

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
      <header className={`project-hero${project.hero || project.heroVideo ? " project-hero--photo" : ""}`}>
        <HeroBackground image={project.hero} video={project.heroVideo} />
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

      {textilesAccess ? (
        fabricError ? (
          <p className="container textiles-load-error">{fabricError}</p>
        ) : (
          <>
            <TextilesCatalog
              fabrics={fabrics}
              selectedId={selectedFabric?.id}
              onOrder={(fabric) => {
                setSelectedFabric(fabric);
                document.getElementById("fabric-order")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            />
            <div id="fabric-order">
              <FabricOrderPanel
                user={user}
                fabrics={fabrics}
                selected={selectedFabric}
                onSelect={setSelectedFabric}
              />
            </div>
          </>
        )
      ) : (
        <>
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
        </>
      )}

      {isBrandOwner(user, slug) ? <OrderPanel user={user} slug={slug} /> : null}
    </article>
  );
}
