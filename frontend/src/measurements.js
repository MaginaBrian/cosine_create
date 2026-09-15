const SIZES = ["XS", "S", "M", "L", "XL", "2XL"];
const GROOVE_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SIZE_RUN_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "XXL"];

export const MWOTAJI_TSHIRT_FABRICS = ["Black - T-shirt", "Off White - T-shirt"];
export const MWOTAJI_FLEECE_FABRICS = ["Black - Fleece", "Teal - Fleece"];

function fabricField(options) {
  return {
    id: "color",
    label: "Fabric",
    placeholder: "Select fabric",
    required: true,
    options,
  };
}

export const GROOVE_TEE_COLORS = ["White", "Black", "Blue"];
export const GROOVE_HAT_OPTIONS = [
  "Bucket hat - Acid wash grey",
  "Baseball hat - Acid wash black",
];

const GROOVE_TEE_COLOR_FIELD = {
  id: "color",
  label: "Colour",
  placeholder: "Select colour",
  required: true,
  options: GROOVE_TEE_COLORS,
};

const GROOVE_HAT_FIELD = {
  id: "color",
  label: "Hat",
  placeholder: "Select hat",
  required: true,
  options: GROOVE_HAT_OPTIONS,
};

const HEIGHT_FIELD = {
  id: "height",
  label: "Height",
  placeholder: "Select height",
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
    fields: [fabricField(MWOTAJI_TSHIRT_FABRICS)],
  },
  {
    id: "hoodie",
    name: "Hoodie",
    category: "hoodies",
    genders: ["shared"],
    brands: ["mwotaji"],
    sizes: SIZES,
    fields: [fabricField(MWOTAJI_FLEECE_FABRICS)],
  },
  {
    id: "sweatshirt",
    name: "Sweatshirt",
    category: "sweatshirts",
    genders: ["shared"],
    brands: ["mwotaji"],
    sizes: SIZES,
    fields: [fabricField(MWOTAJI_FLEECE_FABRICS)],
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
      fabricField(MWOTAJI_FLEECE_FABRICS),
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
      fabricField(MWOTAJI_FLEECE_FABRICS),
      { ...HEIGHT_FIELD, label: "Height (male bottoms)" },
    ],
  },
  {
    id: "crop-top",
    name: "Crop top",
    category: "tops",
    genders: ["women"],
    brands: ["mwotaji"],
    sizes: SIZES,
    fields: [fabricField(MWOTAJI_TSHIRT_FABRICS)],
  },
  {
    id: "vest",
    name: "Vest",
    category: "tops",
    genders: ["men", "women"],
    brands: ["mwotaji"],
    sizes: SIZES,
    fields: [
      fabricField(MWOTAJI_TSHIRT_FABRICS),
      {
        id: "sleeve",
        label: "Sleeve",
        placeholder: "Short or long sleeve",
        required: true,
      },
    ],
  },
  {
    id: "groove-oversized-t-shirt",
    name: "Oversized T-shirt",
    category: "t-shirts",
    genders: ["shared"],
    brands: ["the-groove-hangout"],
    sizes: GROOVE_SIZES,
    fields: [GROOVE_TEE_COLOR_FIELD],
  },
  {
    id: "groove-crop-top",
    name: "Crop top",
    category: "crop-top",
    genders: ["shared"],
    brands: ["the-groove-hangout"],
    sizes: GROOVE_SIZES,
    fields: [GROOVE_TEE_COLOR_FIELD],
  },
  {
    id: "groove-hats",
    name: "Hats",
    category: "hats",
    genders: ["shared"],
    brands: ["the-groove-hangout"],
    sizes: GROOVE_SIZES,
    fields: [GROOVE_HAT_FIELD],
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
  const bySlug = list.find(
    (p) => p.sku_kind === "category" && p.slug === garment.id
  );
  if (bySlug) return bySlug;
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
  const order = SIZE_RUN_ORDER;
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
