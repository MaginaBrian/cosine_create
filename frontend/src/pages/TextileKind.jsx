import { useEffect, useMemo, useState } from "react";
import { fetchFabrics } from "../api";
import { canOrderTextiles } from "../clientHome";
import FabricOrderPanel from "../components/FabricOrderPanel";
import {
  formatSpan,
  groupFabrics,
  isThread,
  kindCover,
  kindFromSlug,
  kindLabel,
  rangesForKind,
  threadName,
} from "../textiles";
import "./Lookbook.css";
import "./TextileKind.css";

export default function TextileKind({ kindSlug, user }) {
  const kind = kindFromSlug(kindSlug);
  const [fabrics, setFabrics] = useState([]);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const canOrder = canOrderTextiles(user);

  useEffect(() => {
    fetchFabrics()
      .then((data) => setFabrics(data.fabrics || []))
      .catch((err) => setError(err.message || "Could not load the mill list"));
  }, []);

  const lines = useMemo(
    () => (kind ? fabrics.filter((row) => row.kind === kind) : []),
    [fabrics, kind]
  );

  useEffect(() => {
    if (lines.length === 1) setSelected(lines[0]);
  }, [lines]);
  const ranges = useMemo(() => rangesForKind(lines), [lines]);
  const groups = useMemo(() => groupFabrics(fabrics), [fabrics]);
  const known = groups.some((group) => group.kind === kind);

  if (!kind || (fabrics.length > 0 && !known)) {
    return (
      <header className="lookbook__head">
        <h1>Not found</h1>
        <p className="lookbook__hint">
          <a href="#/work/cosine-textiles">Back to Cosine Textiles</a>
        </p>
      </header>
    );
  }

  const thread = isThread(kind);
  const label = kindLabel(kind);
  const cover = kindCover(kind);

  return (
    <article className="lookbook textile-kind">
      <header className="lookbook__head">
        <p className="eyebrow">
          <a href="#/work/cosine-textiles">Cosine Textiles</a>
        </p>
        <h1>{label}</h1>
        <p className="lookbook__hint">
          {thread
            ? "Tap the look for ply, fibre and colour range."
            : "Tap the look for fibre, GSM and colour range."}
        </p>
      </header>

      {error ? <p className="container textiles-load-error">{error}</p> : null}

      <div className="lookbook__slides">
        <figure
          className={`product-slide textile-kind__shot${open ? " is-open" : ""}`}
          onClick={() => setOpen((value) => !value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen((value) => !value);
            }
          }}
          tabIndex={0}
          aria-expanded={open}
          aria-label={`${label}. Tap to see composition ranges.`}
        >
          <img src={cover} alt="" className="product-slide__front" />
          <div className="textile-kind__spec">
            <dl>
              {thread ? (
                lines.map((line) => (
                  <div key={line.id}>
                    <dt>{threadName(line)}</dt>
                    <dd>{line.spec || line.code || "—"}</dd>
                  </div>
                ))
              ) : (
                <>
                  {ranges.fibres.map((fibre) => (
                    <div key={fibre.key}>
                      <dt>{fibre.label}</dt>
                      <dd>{formatSpan(fibre.min, fibre.max, "%")}</dd>
                    </div>
                  ))}
                  <div>
                    <dt>GSM</dt>
                    <dd>
                      {ranges.gsm ? formatSpan(ranges.gsm.min, ranges.gsm.max, "") : "—"}
                    </dd>
                  </div>
                </>
              )}
            </dl>
            <figure className="textile-kind__wheel">
              <img src="/textiles/color-wheel.jpg" alt="Full colour range" />
              <figcaption>All colour range</figcaption>
            </figure>
          </div>
        </figure>
      </div>

      {canOrder ? (
        <div id="fabric-order">
          <FabricOrderPanel
            user={user}
            fabrics={lines}
            selected={selected}
            onSelect={setSelected}
          />
        </div>
      ) : null}
    </article>
  );
}
