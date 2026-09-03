export const KIND_ORDER = [
  "T-SHIRT",
  "FLEECE",
  "LINEN",
  "SPORTS/POLO",
  "WORKOUT TEE",
  "LEGGING",
  "WOOL",
  "SPORTS/ JACKET",
  "OUTDOOR JACKET",
];

export const KIND_LABELS = {
  "T-SHIRT": "T-shirt",
  FLEECE: "Fleece",
  LINEN: "Linen",
  "SPORTS/POLO": "Sports / polo",
  "WORKOUT TEE": "Workout tee",
  LEGGING: "Legging",
  WOOL: "Wool",
  "SPORTS/ JACKET": "Sports / jacket",
  "OUTDOOR JACKET": "Outdoor jacket",
};

export const KIND_SLUGS = {
  "T-SHIRT": "t-shirt",
  FLEECE: "fleece",
  LINEN: "linen",
  "SPORTS/POLO": "sports-polo",
  "WORKOUT TEE": "workout-tee",
  LEGGING: "legging",
  WOOL: "wool",
  "SPORTS/ JACKET": "sports-jacket",
  "OUTDOOR JACKET": "outdoor-jacket",
};

export const FIBRE_ORDER = [
  "cotton",
  "polyester",
  "spandex",
  "nylon",
  "linen",
  "tencel",
  "wool",
  "modal",
  "other",
];

export const FIBRE_LABELS = {
  cotton: "Cotton",
  polyester: "Polyester",
  spandex: "Spandex",
  nylon: "Nylon",
  linen: "Linen",
  tencel: "Tencel",
  wool: "Wool",
  modal: "Modal",
  other: "Other",
};

export function kindLabel(kind) {
  return KIND_LABELS[kind] || kind;
}

export function kindSlug(kind) {
  return KIND_SLUGS[kind] || String(kind || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function kindFromSlug(slug) {
  return Object.keys(KIND_SLUGS).find((kind) => KIND_SLUGS[kind] === slug) || null;
}

export function kindCover(kind) {
  return `/textiles/${kindSlug(kind)}.jpg`;
}

export function formatGsm(gsm) {
  return gsm == null ? "GSM —" : `${gsm} GSM`;
}

export function formatMoney(value, currency) {
  if (value == null || value === "") return "—";
  const number = Number(value);
  if (Number.isNaN(number)) return "—";
  const digits = Number.isInteger(number) ? 0 : 2;
  const amount = number.toLocaleString("en-KE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: 2,
  });
  if (currency === "CNY") return `CNY ${amount}`;
  if (currency === "KES") return `KES ${amount}`;
  return amount;
}

export function lineSummary(fabric) {
  if (!fabric) return "Fabric";
  const bits = [kindLabel(fabric.kind), fabric.composition];
  if (fabric.gsm != null) bits.push(`${fabric.gsm} GSM`);
  return bits.filter(Boolean).join(" · ");
}

export function quantityLabel(order) {
  const qty = order?.quantity ?? 0;
  if (order?.unit === "kg") return `${qty} kg`;
  if (order?.unit === "m" || order?.fabric_line || order?.fabric_id) return `${qty} m`;
  return `${qty} pcs`;
}

export function groupFabrics(fabrics) {
  const groups = new Map();
  for (const fabric of fabrics) {
    if (!groups.has(fabric.kind)) groups.set(fabric.kind, []);
    groups.get(fabric.kind).push(fabric);
  }
  const ordered = KIND_ORDER.filter((kind) => groups.has(kind)).map((kind) => ({
    kind,
    label: kindLabel(kind),
    slug: kindSlug(kind),
    cover: kindCover(kind),
    fabrics: groups.get(kind),
  }));
  for (const [kind, rows] of groups) {
    if (!KIND_ORDER.includes(kind)) {
      ordered.push({
        kind,
        label: kindLabel(kind),
        slug: kindSlug(kind),
        cover: kindCover(kind),
        fabrics: rows,
      });
    }
  }
  return ordered;
}

export function fibresOf(fabric) {
  if (fabric?.fibres && typeof fabric.fibres === "object") return fabric.fibres;
  const out = {};
  for (const part of String(fabric?.composition || "").split("·")) {
    const match = part.trim().match(/^(\d+)%\s+(.+)$/i);
    if (match) out[match[2].toLowerCase()] = Number(match[1]);
  }
  return out;
}

export function formatSpan(min, max, suffix) {
  if (min == null || max == null) return "—";
  if (min === max) return `${min}${suffix}`;
  return `${min} — ${max}${suffix}`;
}

export function rangesForKind(fabrics) {
  const rows = fabrics || [];
  const present = new Set();
  for (const row of rows) {
    Object.keys(fibresOf(row)).forEach((key) => present.add(key));
  }
  const fibres = FIBRE_ORDER.filter((key) => present.has(key))
    .map((key) => {
      const values = rows.map((row) => Number(fibresOf(row)[key] || 0));
      return {
        key,
        label: FIBRE_LABELS[key] || key,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    })
    .filter((row) => row.max > 0);

  const gsmValues = rows.map((row) => row.gsm).filter((value) => value != null);
  return {
    fibres,
    gsm: gsmValues.length
      ? { min: Math.min(...gsmValues), max: Math.max(...gsmValues) }
      : null,
  };
}
