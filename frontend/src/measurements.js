const SIZES = ["XS", "S", "M", "L", "XL", "2XL"];

const COLOR_FIELD = {
  id: "color",
  label: "Type of color",
  placeholder: "Write the colourway",
  required: true,
};

const HEIGHT_FIELD = {
  id: "height",
  label: "Height",
  required: true,
  options: ["Short", "Regular", "Tall"],
};

export const GARMENTS = [
  {
    id: "oversized-t-shirt",
    name: "Oversized T-shirt",
    category: "tops",
    genders: ["men", "women"],
    brands: ["mwotaji"],
    sizes: SIZES,
    fields: [COLOR_FIELD],
  },
  {
    id: "hoodie",
    name: "Hoodie",
    category: "hoodies",
    genders: ["shared"],
    brands: ["mwotaji"],
    sizes: SIZES,
    fields: [COLOR_FIELD],
  },
  {
    id: "sweatshirt",
    name: "Sweatshirt",
    category: "sweatshirts",
    genders: ["shared"],
    brands: ["mwotaji"],
    sizes: SIZES,
    fields: [COLOR_FIELD],
  },
  {
    id: "female-sweatpants",
    name: "Female sweatpants",
    category: "bottoms",
    genders: ["women"],
    brands: ["mwotaji"],
    sizes: SIZES,
    sex: "female",
    fields: [
      COLOR_FIELD,
      { ...HEIGHT_FIELD, label: "Height (female bottoms)" },
    ],
  },
  {
    id: "male-sweatpants",
    name: "Male sweatpants",
    category: "bottoms",
    genders: ["men"],
    brands: ["mwotaji"],
    sizes: SIZES,
    sex: "male",
    fields: [
      COLOR_FIELD,
      { ...HEIGHT_FIELD, label: "Height (male bottoms)" },
    ],
  },
  {
    id: "vest",
    name: "Vest",
    category: "tops",
    genders: ["men", "women"],
    brands: ["mwotaji"],
    sizes: SIZES,
    fields: [
      COLOR_FIELD,
      {
        id: "sleeve",
        label: "Sleeve",
        placeholder: "Short or long sleeve",
        required: true,
      },
    ],
  },
];

export function garmentsForBrand(slug) {
  return GARMENTS.filter((g) => g.brands.includes(slug));
}

export function garmentsForLook(slug, gender, categoryId) {
  return garmentsForBrand(slug).filter((g) => {
    if (g.category !== categoryId) return false;
    if (!gender) return g.genders.includes("shared") || g.genders.length > 0;
    return g.genders.includes(gender) || g.genders.includes("shared");
  });
}

export function matchCatalogProduct(products, garment, gender) {
  const list = products || [];
  const wantedGender =
    gender || (garment.genders.includes("shared") ? "shared" : garment.genders[0]);
  return (
    list.find(
      (p) =>
        p.sku_kind === "category" &&
        p.category === garment.category &&
        p.gender === wantedGender
    ) || list.find((p) => p.sku_kind === "category" && p.category === garment.category)
  );
}

export function formatSizeRun(breakdown) {
  if (!breakdown || typeof breakdown !== "object") return "";
  const order = SIZES;
  return order
    .filter((size) => Number(breakdown[size]) > 0)
    .map((size) => `${size} ${breakdown[size]}`)
    .concat(
      Object.entries(breakdown)
        .filter(([size, qty]) => !order.includes(size) && Number(qty) > 0)
        .map(([size, qty]) => `${size} ${qty}`)
    )
    .join(" · ");
}

export function formatSpecNotes(fields, values, extra) {
  const lines = [];
  for (const field of fields || []) {
    const value = (values[field.id] || "").trim();
    if (value) lines.push(`${field.label}: ${value}`);
  }
  if (extra) lines.push(extra);
  return lines.join("\n") || undefined;
}
