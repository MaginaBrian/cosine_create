import { useMemo, useState } from "react";
import { formatGsm, groupFabrics, kindLabel } from "../textiles";
import "./TextilesCatalog.css";

export default function TextilesCatalog({ fabrics, full, selectedId, onOrder }) {
  const groups = useMemo(() => groupFabrics(fabrics), [fabrics]);
  const [kind, setKind] = useState("all");
  const visible = kind === "all" ? groups : groups.filter((group) => group.kind === kind);

  return (
    <section className="textiles" aria-label="Fabric catalogue">
      <div className="container">
        <div className="textiles__intro">
          <p className="eyebrow">Cosine Textiles</p>
          <h2>{full ? "Mill list." : "The lines."}</h2>
          <p>
            {full
              ? "Supplier, mill code, prices and usage stay here. Buyers only see type, composition and GSM until colour cards are on the sheet."
              : onOrder
                ? "Type, composition and GSM. Order a line and it shows on the studio admin list. Colour range will show when a card is on file."
                : "Type, composition and GSM. Anyone can browse the lines. A buyer account is needed to place an order. Colour range will show when a card is on file."}
          </p>
        </div>

        {groups.length > 1 ? (
          <div className="textiles__filters" role="tablist" aria-label="Fabric type">
            <button
              type="button"
              className={kind === "all" ? "is-on" : ""}
              onClick={() => setKind("all")}
            >
              All
            </button>
            {groups.map((group) => (
              <button
                key={group.kind}
                type="button"
                className={kind === group.kind ? "is-on" : ""}
                onClick={() => setKind(group.kind)}
              >
                {group.label}
              </button>
            ))}
          </div>
        ) : null}

        {visible.map((group) => (
          <div key={group.kind} className="textiles__group">
            <h3>{group.label}</h3>
            <ul className="textiles__grid">
              {group.fabrics.map((fabric) => (
                <li key={fabric.id}>
                  <article className={`textiles-card${selectedId === fabric.id ? " is-selected" : ""}`}>
                    {full ? (
                      <p className="textiles-card__meta">
                        <span>{fabric.supplier || "Unlisted mill"}</span>
                        <strong>{fabric.code}</strong>
                      </p>
                    ) : (
                      <p className="textiles-card__type">{kindLabel(fabric.kind)}</p>
                    )}
                    <p className="textiles-card__comp">{fabric.composition}</p>
                    <p className="textiles-card__gsm">{formatGsm(fabric.gsm)}</p>
                    {full && fabric.usage ? (
                      <p className="textiles-card__usage">{fabric.usage}</p>
                    ) : null}
                    {fabric.colors?.length ? (
                      <ul className="textiles-card__colors">
                        {fabric.colors.map((color) => (
                          <li key={color}>{color}</li>
                        ))}
                      </ul>
                    ) : null}
                    {full ? (
                      <dl className="textiles-card__prices">
                        <div>
                          <dt>Per kg</dt>
                          <dd>
                            {formatPriceLine(fabric.price_kg_cny, fabric.price_kg_kes, fabric.price_kg_cosintex)}
                          </dd>
                        </div>
                        <div>
                          <dt>Per metre</dt>
                          <dd>
                            {formatPriceLine(fabric.price_m_cny, fabric.price_m_kes, fabric.price_m_cosintex)}
                          </dd>
                        </div>
                      </dl>
                    ) : null}
                    {onOrder ? (
                      <button
                        type="button"
                        className="textiles-card__order"
                        onClick={() => onOrder(fabric)}
                      >
                        {selectedId === fabric.id ? "Ordering this line" : "Order this line"}
                      </button>
                    ) : null}
                  </article>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatPriceLine(cny, kes, cosintex) {
  const bits = [];
  if (cny != null) bits.push(`CNY ${formatNum(cny)}`);
  if (kes != null) bits.push(`KES ${formatNum(kes)}`);
  if (cosintex != null) bits.push(`Cosintex KES ${formatNum(cosintex)}`);
  return bits.length ? bits.join(" · ") : "—";
}

function formatNum(value) {
  const number = Number(value);
  const digits = Number.isInteger(number) ? 0 : 2;
  return number.toLocaleString("en-KE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: 2,
  });
}
