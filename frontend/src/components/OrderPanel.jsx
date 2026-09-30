import { useEffect, useMemo, useState } from "react";
import { createOrder, fetchOrders, fetchProducts } from "../api";
import {
  cartLineKey,
  cartTotal,
  clearCart,
  loadCart,
  mergeCartItem,
  saveCart,
} from "../orderCart";
import {
  fitForGarment,
  formatSizeRun,
  garmentsForLook,
  matchCatalogProduct,
} from "../measurements";
import PastOrders from "./PastOrders";
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

function isPhone(value) {
  return String(value || "").replace(/\D/g, "").length >= 7;
}

function goToClientHome(slug) {
  window.location.hash = `#/work/${slug}`;
}

function grooveAddCopy(garment, categoryId) {
  const hats = "Choose Bucket hat - Acid wash grey, or Baseball hat - Acid wash black.";
  const tees = "Choose White, Black or Blue.";
  const tags = "Choose Black, White or Green.";
  if (categoryId === "hats") {
    return { title: "Add hats.", steps: ["Set quantities by size.", hats, "Add, then pick the next product."] };
  }
  if (categoryId === "tags") {
    return { title: "Add tags.", steps: ["Set the quantity.", tags, "Add, then pick the next product."] };
  }
  if (categoryId === "crop-top") {
    return { title: "Add the crop turn-up.", steps: ["Set quantities by size (XS–XXL).", tees, "Add, then pick the next product."] };
  }
  if (categoryId === "t-shirts") {
    return {
      title: "Add the oversized T-shirt.",
      steps: ["Set quantities by size (XS–XXL).", tees, "Add, then pick the next product."],
    };
  }
  return {
    title: "Add to the 7th edition order.",
    steps: [
      "Set quantities by size.",
      garment?.id === "groove-hats" ? hats : garment?.id === "groove-tags" ? tags : tees,
      "Add, then go back to the catalogue for the next product.",
    ],
  };
}

function CartList({ cart, onRemove }) {
  const pieces = cartTotal(cart);
  if (!cart.length) return null;
  return (
    <div className="order-cart">
      <p className="eyebrow">This order</p>
      <ul>
        {cart.map((item) => (
          <li key={item.id || cartLineKey(item)}>
            <div>
              <strong>{item.name || item.product_name || "Item"}</strong>
              <span>
                {[item.color, item.height, formatSizeRun(item.sizes), `${item.quantity} pcs`]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
            {onRemove ? (
              <button
                type="button"
                className="order-size__remove"
                onClick={() => onRemove(item.id)}
              >
                Remove
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="order-sizes__total">
        {cart.length} {cart.length === 1 ? "product" : "products"} · {pieces} pcs
      </p>
    </div>
  );
}

export default function OrderPanel({ user, slug, gender = null, categoryId = null }) {
  const isAdd = Boolean(categoryId);
  const lookGarments = useMemo(
    () => (isAdd ? garmentsForLook(slug, gender, categoryId) : []),
    [isAdd, slug, gender, categoryId]
  );

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [garmentId, setGarmentId] = useState(lookGarments[0]?.id || "");
  const [sizeLines, setSizeLines] = useState(() => emptyLines(lookGarments[0]?.sizes));
  const [specs, setSpecs] = useState(() => emptySpecs(lookGarments[0]?.fields));
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [cart, setCart] = useState(() => loadCart(slug));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const garment = lookGarments.find((g) => g.id === garmentId) || null;
  const isBottoms = garment?.category === "bottoms";
  const isGroove = slug === "the-groove-hangout";

  const persistCart = (next) => {
    setCart(next);
    saveCart(slug, next);
  };

  const load = async () => {
    const requests = [fetchOrders()];
    if (isAdd) requests.unshift(fetchProducts());
    const results = await Promise.allSettled(requests);
    if (isAdd) {
      const productsResult = results[0];
      const ordersResult = results[1];
      if (productsResult.status === "fulfilled") {
        setProducts(productsResult.value.products || []);
      } else {
        throw productsResult.reason;
      }
      if (ordersResult?.status === "fulfilled") {
        setOrders(ordersResult.value.orders || []);
      }
      return;
    }
    const ordersResult = results[0];
    if (ordersResult.status === "fulfilled") {
      setOrders(ordersResult.value.orders || []);
    } else {
      throw ordersResult.reason;
    }
  };

  useEffect(() => {
    setCart(loadCart(slug));
  }, [slug]);

  useEffect(() => {
    load().catch((err) => setError(err.message));
    const refresh = () => {
      fetchOrders()
        .then((o) => setOrders(o.orders || []))
        .catch(() => {});
    };
    const timer = setInterval(refresh, 5000);
    const onFocus = () => {
      setCart(loadCart(slug));
      refresh();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [slug, isAdd]);

  useEffect(() => {
    if (!lookGarments.length) return;
    if (garmentId && lookGarments.some((g) => g.id === garmentId)) return;
    const next = lookGarments[0];
    setGarmentId(next.id);
    setSizeLines(emptyLines(next.sizes));
    setSpecs(emptySpecs(next.fields));
  }, [lookGarments, garmentId, gender]);

  const applyGarment = (next) => {
    setGarmentId(next.id);
    setSizeLines(emptyLines(next.sizes));
    setSpecs(emptySpecs(next.fields));
  };

  const onGarmentChange = (id) => {
    if (!id) {
      setGarmentId("");
      setSizeLines(emptyLines([]));
      setSpecs(emptySpecs([]));
      return;
    }
    const next = lookGarments.find((g) => g.id === id);
    if (next) applyGarment(next);
  };

  const currentLine = () => {
    if (!garment) return { error: "Choose a product." };
    if (sizeLines.some((line) => !line.size || Number(line.qty) < 1)) {
      return { error: "Enter a size and a quantity of at least 1." };
    }
    const sizes = linesToPayload(sizeLines);
    const quantity = totalFromLines(sizeLines);
    if (quantity < 1) return { error: "Add a quantity for at least one size." };
    for (const field of garment.fields || []) {
      if (!(specs[field.id] || "").trim()) {
        return {
          error: field.options
            ? `Choose a ${field.label.toLowerCase()}.`
            : `Write the ${field.label.toLowerCase()}.`,
        };
      }
    }
    const product = matchCatalogProduct(products, garment, fitForGarment(garment, gender));
    if (!product) {
      return {
        error: products.length
          ? "No catalog product matches this garment."
          : "Your catalog is not set up yet. Contact the studio.",
      };
    }
    return {
      line: {
        product_id: product.id,
        product_name: product.name,
        garment: garment.id,
        name: garment.name,
        quantity,
        sizes,
        color: (specs.color || "").trim() || undefined,
        height: (specs.height || "").trim() || undefined,
      },
    };
  };

  const onAdd = (e) => {
    e.preventDefault();
    setError("");
    const { line, error: lineError } = currentLine();
    if (lineError) {
      setError(lineError);
      return;
    }
    persistCart(mergeCartItem(cart, line));
    goToClientHome(slug);
  };

  const onSend = async (e) => {
    e.preventDefault();
    setError("");
    if (!cart.length) {
      setError("Add a product to this order first.");
      return;
    }
    if (slug === "mwotaji" && !customerName.trim()) {
      setError("Enter the customer name.");
      return;
    }
    if (!isPhone(phone)) {
      setError("Enter a phone number.");
      return;
    }
    setBusy(true);
    try {
      await createOrder({
        items: cart.map((item) => ({
          product_id: item.product_id,
          garment: item.garment,
          quantity: item.quantity,
          sizes: item.sizes,
          color: item.color,
          height: item.height,
        })),
        name: slug === "mwotaji" ? customerName.trim() : user.name,
        brand: user.brand,
        email: user.email,
        phone: phone.trim(),
        making: "Apparel",
        stage: "processing",
        notes: notes.trim() || undefined,
      });
      clearCart(slug);
      setCart([]);
      setSent(true);
      setNotes("");
      setPhone("");
      setCustomerName("");
      await load();
    } catch (err) {
      setError(err.message || "Could not send order");
    } finally {
      setBusy(false);
    }
  };

  const sexLabel =
    garment?.sex === "male" ? "Male" : garment?.sex === "female" ? "Female" : null;
  const grooveCopy = isAdd && isGroove ? grooveAddCopy(garment, categoryId) : null;

  if (isAdd) {
    return (
      <section className="order-panel" aria-label="Add to this order">
        <div className="order-panel__intro">
          <p className="eyebrow">Production order</p>
          <h2>{grooveCopy ? grooveCopy.title : `Add ${garment?.name || "this product"}.`}</h2>
          {grooveCopy ? (
            <ol className="order-panel__steps">
              {grooveCopy.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          ) : (
            <p>
              Set sizes and fabric for this product, then add it. You will go back to the {user.brand}{" "}
              page to pick the next one.
            </p>
          )}
        </div>

        <form className="order-panel__form" onSubmit={onAdd}>
          {lookGarments.length > 1 ? (
            <div className="field">
              <label htmlFor="order-garment">Product</label>
              <select
                id="order-garment"
                value={garmentId}
                onChange={(e) => onGarmentChange(e.target.value)}
                required
              >
                <option value="">Select product</option>
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

          {isBottoms && sexLabel ? <p className="order-panel__sex">{sexLabel} bottoms</p> : null}

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
                        required
                      >
                        {line.size ? null : <option value="">Select size</option>}
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
                        min="1"
                        step="1"
                        inputMode="numeric"
                        value={line.qty}
                        onChange={(e) =>
                          setSizeLines((rows) =>
                            rows.map((row, i) =>
                              i === index ? { ...row, qty: e.target.value } : row
                            )
                          )
                        }
                        placeholder="1"
                        required
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
                  required
                >
                  <option value="">{field.placeholder || "Select"}</option>
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
                  required
                />
              )}
            </div>
          ))}

          {error ? <p className="order-panel__error">{error}</p> : null}

          <button className="btn" type="submit">
            Add
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="order-panel" aria-label="Finish this order">
      <div className="order-panel__intro">
        <p className="eyebrow">Production order</p>
        <h2>{cart.length ? "Finish this order." : `Order from the ${user.brand} catalog.`}</h2>
        <p>
          {cart.length
            ? slug === "mwotaji"
              ? "When every product is in, add the customer name, a phone number and any notes, then send."
              : "When every product is in, add a phone number and any notes, then send."
            : "Open a product above to add it. Come back here when the order is complete."}
        </p>
      </div>

      {cart.length ? (
        <form className="order-panel__form" onSubmit={onSend}>
          <CartList cart={cart} onRemove={(id) => persistCart(cart.filter((row) => row.id !== id))} />

          {slug === "mwotaji" ? (
            <>
            <div className="field">
              <label htmlFor="order-customer-name">Customer name</label>
              <input
                id="order-customer-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="order-email">Email</label>
              <input id="order-email" type="email" value={user.email || ""} readOnly />
            </div>
            </>
          ) : null}

          <div className="field">
            <label htmlFor="order-phone">Phone number</label>
            <input
              id="order-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              required
            />
          </div>

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

          <button className="btn btn--invert" type="submit" disabled={busy}>
            {busy ? "Sending…" : "Send order"}
          </button>
        </form>
      ) : (
        <>
          {error ? <p className="order-panel__error">{error}</p> : null}
          {sent ? <p className="order-panel__ok">Order received.</p> : null}
        </>
      )}

      <PastOrders orders={orders} />
    </section>
  );
}
