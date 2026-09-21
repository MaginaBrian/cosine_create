const storageKey = (slug) => `cc-order-cart-${slug}`;

function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `line-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function loadCart(slug) {
  if (!slug) return [];
  try {
    const data = JSON.parse(localStorage.getItem(storageKey(slug)));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveCart(slug, items) {
  if (!slug) return;
  localStorage.setItem(storageKey(slug), JSON.stringify(items || []));
}

export function clearCart(slug) {
  if (!slug) return;
  localStorage.removeItem(storageKey(slug));
}

export function cartLineKey(item) {
  return [item.garment, item.color || "", item.height || ""].join("|");
}

export function mergeCartItem(items, next) {
  const incoming = { ...next, id: next.id || newId() };
  const key = cartLineKey(incoming);
  const index = (items || []).findIndex((row) => cartLineKey(row) === key);
  if (index < 0) return [...(items || []), incoming];
  const sizes = { ...(items[index].sizes || {}) };
  for (const [size, qty] of Object.entries(incoming.sizes || {})) {
    sizes[size] = (sizes[size] || 0) + Number(qty);
  }
  const quantity = Object.values(sizes).reduce((sum, n) => sum + Number(n || 0), 0);
  const copy = [...items];
  copy[index] = { ...items[index], sizes, quantity };
  return copy;
}

export function cartTotal(items) {
  return (items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}
