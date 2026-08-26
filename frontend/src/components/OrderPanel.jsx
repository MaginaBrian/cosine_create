import { useEffect, useMemo, useState } from "react";
import { createOrder, fetchOrders, fetchProducts } from "../api";
import {
  GARMENTS,
  formatSizeRun,
  garmentsForBrand,
  garmentsForLook,
  matchCatalogProduct,
} from "../measurements";
import "./OrderPanel.css";

function emptyLines(sizes) {
  return [{ size: sizes?.[0] || "XS", qty: "" }];
}

function emptySpecs(fields) {
  return Object.fromEntries((fields || []).map((f) => [f.id, ""]));
}

function linesToPayload(lines) {
  const out = {};
  for (const line of lines) {
    const n = Number(line.qty);
    if (line.size && n > 0) out[line.size] = (out[line.size] || 0) + n;
  }
  return out;
}

function totalFromLines(lines) {
  return Object.values(linesToPayload(lines)).reduce((sum, n) => sum + n, 0);
}

export default function OrderPanel({ user, slug, gender = null, categoryId = null }) {
  const lookGarments = useMemo(
    () => (categoryId ? garmentsForLook(slug, gender, categoryId) : garmentsForBrand(slug)),
    [slug, gender, categoryId]
  );

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [garmentId, setGarmentId] = useState(lookGarments[0]?.id || "");
  const [fitGender, setFitGender] = useState(gender || lookGarments[0]?.genders[0] || "men");
  const [sizeLines, setSizeLines] = useState(() => emptyLines(lookGarments[0]?.sizes));
  const [specs, setSpecs] = useState(() => emptySpecs(lookGarments[0]?.fields));
  const [notes, setNotes] = useState("");
  const [productId, setProductId] = useState("");
  const [simpleQty, setSimpleQty] = useState("");
  const [simpleColor, setSimpleColor] = useState("");
  const [simpleFabric, setSimpleFabric] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const catalog = useMemo(
    () => (products || []).filter((p) => p.sku_kind === "category"),
    [products]
  );

  const garment = lookGarments.find((g) => g.id === garmentId) || lookGarments[0];
  const isBottoms = garment?.category === "bottoms";
  const needsGender = Boolean(
    garment && !gender && (isBottoms || garment.genders.includes("men"))
  );

  const load = async () => {
    const [p, o] = await Promise.all([fetchProducts(), fetchOrders()]);
    setProducts(p.products || []);
    setOrders(o.orders || []);
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!lookGarments.length) return;
    if (lookGarments.some((g) => g.id === garmentId)) return;
    const next = lookGarments[0];
    setGarmentId(next.id);
    setSizeLines(emptyLines(next.sizes));
    setSpecs(emptySpecs(next.fields));
    if (!gender) {
      setFitGender(next.genders.includes("shared") ? "shared" : next.genders[0]);
    }
  }, [lookGarments, garmentId, gender]);

  const applyGarment = (next) => {
    setGarmentId(next.id);
    setSizeLines(emptyLines(next.sizes));
    setSpecs(emptySpecs(next.fields));
    setSent(false);
    if (!gender) {
      setFitGender(next.genders.includes("shared") ? "shared" : next.genders[0]);
    }
  };

  const onGarmentChange = (id) => {
    const next = lookGarments.find((g) => g.id === id);
    if (next) applyGarment(next);
  };

  const onFitChange = (value) => {
    setFitGender(value);
    if (isBottoms || lookGarments.some((g) => g.category === "bottoms")) {
      const match = lookGarments.find(
        (g) => g.category === "bottoms" && g.genders.includes(value)
      );
      if (match && match.id !== garment?.id) applyGarment(match);
    }
  };

  const onSubmitPom = async (e) => {
    e.preventDefault();
    setError("");
    const sizes = linesToPayload(sizeLines);
    const quantity = totalFromLines(sizeLines);
    if (!garment || quantity < 1) {
      setError("Add a quantity for at least one size.");
      return;
    }
    for (const field of garment.fields || []) {
      if (field.required && !(specs[field.id] || "").trim()) {
        setError(`Write the ${field.label.toLowerCase()}.`);
        return;
      }
    }
    const chosenGender =
      gender ||
      (garment.sex === "female"
        ? "women"
        : garment.sex === "male"
          ? "men"
          : garment.genders.includes("shared")
            ? "shared"
            : fitGender);
    const product = matchCatalogProduct(products, garment, chosenGender);
    if (!product) {
      setError("No catalog product matches this garment.");
      return;
    }
    const sexLine = garment.sex
      ? `Fit: ${garment.sex === "male" ? "Male" : "Female"} bottoms`
      : null;
    const sleeve = (specs.sleeve || "").trim();
    const extraNotes = [sleeve ? `Sleeve: ${sleeve}` : "", sexLine, notes.trim()]
      .filter(Boolean)
      .join("\n");
    setBusy(true);
    try {
      await createOrder({
        product_id: product.id,
        name: user.name,
        brand: user.brand,
        email: user.email,
        making: "Apparel",
        quantity,
        stage: "brief",
        garment: garment.id,
        sizes,
        color: (specs.color || "").trim() || undefined,
        height: (specs.height || "").trim() || undefined,
        fabric: (specs.fabric || "").trim() || undefined,
        notes: extraNotes || undefined,
      });
      setSent(true);
      setSizeLines(emptyLines(garment.sizes));
      setSpecs(emptySpecs(garment.fields));
      setNotes("");
      await load();
    } catch (err) {
      setError(err.message || "Could not send order");
    } finally {
      setBusy(false);
    }
  };

  const onSubmitSimple = async (e) => {
    e.preventDefault();
    setError("");
    const quantity = Number(simpleQty);
    if (!productId || !quantity) {
      setError("Choose a product and quantity.");
      return;
    }
    if (!simpleColor.trim()) {
      setError("Write the type of color.");
      return;
    }
    if (!simpleFabric.trim()) {
      setError("Write the apparel fabric.");
      return;
    }
    setBusy(true);
    try {
      await createOrder({
        product_id: Number(productId),
        name: user.name,
        brand: user.brand,
        email: user.email,
        making: "Apparel",
        quantity,
        stage: "brief",
        color: simpleColor.trim(),
        fabric: simpleFabric.trim(),
        notes: notes.trim() || undefined,
      });
      setSent(true);
      setSimpleQty("");
      setSimpleColor("");
      setSimpleFabric("");
      setNotes("");
      await load();
    } catch (err) {
      setError(err.message || "Could not send order");
    } finally {
      setBusy(false);
    }
  };

  const sexLabel =
    garment?.sex === "male" ? "Male" : garment?.sex === "female" ? "Female" : null;

  return (
    <section className="order-panel" aria-label="Place an order">
      <div className="order-panel__intro">
        <p className="eyebrow">Production order</p>
        <h2>Order from the {user.brand} catalog.</h2>
        <p>
          Pick the product, write the colour, and set quantities in XS–2XL. Bottoms need male or
          female and a height of Short, Regular or Tall. Public visitors do not see this.
        </p>
      </div>

      {lookGarments.length ? (
        <form className="order-panel__form" onSubmit={onSubmitPom}>
          {lookGarments.length > 1 ? (
            <div className="field">
              <label htmlFor="order-garment">Product</label>
              <select
                id="order-garment"
                value={garment?.id || ""}
                onChange={(e) => onGarmentChange(e.target.value)}
              >
                {lookGarments.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          ) : garment ? (
            <p className="order-panel__garment">{garment.name}</p>
          ) : null}

          {isBottoms ? (
            <p className="order-panel__sex">
              {sexLabel ? `${sexLabel} bottoms` : "Choose male or female bottoms"}
            </p>
          ) : null}

          {needsGender ? (
            <div className="field">
              <label htmlFor="order-fit">{isBottoms ? "Male or female" : "Men or women"}</label>
              <select
                id="order-fit"
                value={isBottoms ? garment?.genders[0] || fitGender : fitGender}
                onChange={(e) => onFitChange(e.target.value)}
              >
                {isBottoms
                  ? lookGarments
                      .filter((g) => g.category === "bottoms")
                      .map((g) => (
                        <option key={g.id} value={g.genders[0]}>
                          {g.sex === "male" ? "Male" : "Female"}
                        </option>
                      ))
                  : garment.genders
                      .filter((g) => g !== "shared")
                      .map((g) => (
                        <option key={g} value={g}>
                          {g === "men" ? "Men" : "Women"}
                        </option>
                      ))}
              </select>
            </div>
          ) : null}

          {garment ? (
            <div className="order-sizes">
              <p className="eyebrow">Size and quantity</p>
              {sizeLines.map((line, index) => {
                const taken = sizeLines
                  .map((row, i) => (i === index ? null : row.size))
                  .filter(Boolean);
                const options = garment.sizes.filter(
                  (s) => s === line.size || !taken.includes(s)
                );
                return (
                  <div className="order-size" key={`${line.size}-${index}`}>
                    <div className="field">
                      <label htmlFor={`size-${index}`}>Size</label>
                      <select
                        id={`size-${index}`}
                        value={line.size}
                        onChange={(e) =>
                          setSizeLines((rows) =>
                            rows.map((row, i) =>
                              i === index ? { ...row, size: e.target.value } : row
                            )
                          )
                        }
                      >
                        {options.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor={`qty-${index}`}>Quantity</label>
                      <input
                        id={`qty-${index}`}
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={line.qty}
                        onChange={(e) =>
                          setSizeLines((rows) =>
                            rows.map((row, i) =>
                              i === index ? { ...row, qty: e.target.value } : row
                            )
                          )
                        }
                        placeholder="0"
                      />
                    </div>
                    {sizeLines.length > 1 ? (
                      <button
                        type="button"
                        className="order-size__remove"
                        onClick={() =>
                          setSizeLines((rows) => rows.filter((_, i) => i !== index))
                        }
                      >
                        Remove size
                      </button>
                    ) : null}
                  </div>
                );
              })}
              {sizeLines.length < garment.sizes.length ? (
                <button
                  type="button"
                  className="order-size__add"
                  onClick={() => {
                    const taken = sizeLines.map((row) => row.size);
                    const next = garment.sizes.find((s) => !taken.includes(s));
                    if (next) setSizeLines((rows) => [...rows, { size: next, qty: "" }]);
                  }}
                >
                  Add another size
                </button>
              ) : null}
              <p className="order-sizes__total">Total {totalFromLines(sizeLines) || 0} pcs</p>
            </div>
          ) : null}

          {(garment?.fields || []).map((field) => (
            <div className="field" key={field.id}>
              <label htmlFor={`spec-${field.id}`}>{field.label}</label>
              {field.options ? (
                <select
                  id={`spec-${field.id}`}
                  value={specs[field.id] ?? ""}
                  onChange={(e) => setSpecs((s) => ({ ...s, [field.id]: e.target.value }))}
                  required={field.required}
                >
                  <option value="">Select height</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`spec-${field.id}`}
                  value={specs[field.id] ?? ""}
                  onChange={(e) => setSpecs((s) => ({ ...s, [field.id]: e.target.value }))}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              )}
            </div>
          ))}

          <div className="field">
            <label htmlFor="order-notes">Notes</label>
            <textarea
              id="order-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Delivery window, anything else."
            />
          </div>

          {error ? <p className="order-panel__error">{error}</p> : null}
          {sent ? <p className="order-panel__ok">Order received.</p> : null}

          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Sending…" : "Send order"}
          </button>
        </form>
      ) : (
        <form className="order-panel__form" onSubmit={onSubmitSimple}>
          <div className="field">
            <label htmlFor="order-product">Your catalog</label>
            <select
              id="order-product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            >
              <option value="">Select a {user.brand} product</option>
              {catalog.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="order-sizes">
            <p className="eyebrow">Quantity by size</p>
            <div className="field">
              <label htmlFor="order-qty">Total quantity</label>
              <input
                id="order-qty"
                type="number"
                min="1"
                value={simpleQty}
                onChange={(e) => setSimpleQty(e.target.value)}
                placeholder="From 50"
                required
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="order-color-simple">Type of color</label>
            <input
              id="order-color-simple"
              value={simpleColor}
              onChange={(e) => setSimpleColor(e.target.value)}
              placeholder="Write the colourway"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="order-fabric-simple">Apparel fabric</label>
            <input
              id="order-fabric-simple"
              value={simpleFabric}
              onChange={(e) => setSimpleFabric(e.target.value)}
              placeholder="Write the fabric"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="order-notes-simple">Notes</label>
            <textarea
              id="order-notes-simple"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Delivery window, anything else."
            />
          </div>
          {error ? <p className="order-panel__error">{error}</p> : null}
          {sent ? <p className="order-panel__ok">Order received.</p> : null}
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Sending…" : "Send order"}
          </button>
        </form>
      )}

      {orders.length ? (
        <div className="order-panel__history">
          <p className="eyebrow">Your orders</p>
          <ul>
            {orders.map((o) => (
              <li key={o.id}>
                <span>{o.ref}</span>
                <strong>
                  {GARMENTS.find((g) => g.id === o.garment)?.name || o.product?.name}
                </strong>
                <em>
                  {o.quantity} pcs
                  {formatSizeRun(o.sizes) ? ` · ${formatSizeRun(o.sizes)}` : ""}
                </em>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
