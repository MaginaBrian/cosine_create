import { useMemo } from "react";
import { groupFabrics } from "../textiles";
import "./TextilesCatalog.css";

export default function TextilesCatalog({ fabrics }) {
  const groups = useMemo(() => groupFabrics(fabrics), [fabrics]);

  return (
    <section className="textiles" aria-label="Fabric catalogue">
      <div className="container">
        <div className="textiles__intro">
          <p className="eyebrow">Cosine Textiles</p>
          <h2>The cloth.</h2>
          <p>
            Each type is one look. Open it for fibre and GSM ranges from the mill list, and a
            colour wheel for the full range we dye to.
          </p>
        </div>

        <ul className="textiles-types">
          {groups.map((group) => (
            <li key={group.kind}>
              <a
                href={`#/work/cosine-textiles/${group.slug}`}
                className="textiles-type"
                aria-label={group.label}
              >
                <img src={group.cover} alt="" />
                <span>{group.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
