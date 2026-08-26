import { useState } from "react";
import { getLook } from "../data";
import { isBrandOwner } from "../clientHome";
import OrderPanel from "../components/OrderPanel";
import "./Lookbook.css";

function ProductSlide({ front, back, alt }) {
  const [flipped, setFlipped] = useState(false);

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
      {back ? <img src={back} alt="" className="product-slide__back" /> : null}
    </figure>
  );
}

export default function Lookbook({ slug, gender, categoryId, user }) {
  const data = getLook(slug, gender, categoryId);

  if (!data) {
    return (
      <header className="lookbook__head">
        <h1>Not found</h1>
        <p className="lookbook__hint">
          <a href={`#/work/${slug}`}>Back to client</a>
        </p>
      </header>
    );
  }

  const { project, category, look } = data;
  const genderLabel = gender === "women" ? "Women" : gender === "men" ? "Men" : null;
  const items = look.items || [];

  return (
    <article className="lookbook">
      <header className="lookbook__head">
        <p className="eyebrow">
          <a href={`#/work/${project.slug}`}>{project.client}</a>
          {genderLabel ? (
            <>
              <span aria-hidden="true"> / </span>
              {genderLabel}
            </>
          ) : null}
        </p>
        <h1>{category.label}</h1>
        <p className="lookbook__hint">Hover or tap a look to see the back.</p>
      </header>

      <div className="lookbook__slides">
        {items.map((item, i) => (
          <ProductSlide
            key={item.front}
            front={item.front}
            back={item.back}
            alt={`${project.client} ${[genderLabel, category.label].filter(Boolean).join(" ")} ${i + 1}`}
          />
        ))}
      </div>

      {isBrandOwner(user, slug) ? (
        <OrderPanel user={user} slug={slug} gender={gender} categoryId={categoryId} />
      ) : null}
    </article>
  );
}
