const SIZES = ["XS", "S", "M", "L", "XL", "2XL"];
const GROOVE_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const GROOVE_HAT_SIZE = ["Standard"];
const SIZE_RUN_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "XXL", "Standard"];

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
export const GROOVE_TAG_COLORS = ["Black", "White", "Green"];

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

const GROOVE_TAG_FIELD = {
  id: "color",
  label: "Colour",
  placeholder: "Select colour",
  required: true,
  options: GROOVE_TAG_COLORS,
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
    fields: [fabricField(MWOTAJI_TSHIRT_FABRICS)],
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
    name: "Crop turn-up",
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
    sizes: GROOVE_HAT_SIZE,
    fields: [GROOVE_HAT_FIELD],
  },
  {
    id: "groove-tags",
    name: "Tags",
    category: "tags",
    genders: ["shared"],
    brands: ["the-groove-hangout"],
    sizes: GROOVE_HAT_SIZE,
    fields: [GROOVE_TAG_FIELD],
  },
];

export function garmentsForBrand(slug) {
  return GARMENTS.filter((g) => g.brands.includes(slug));
}

function matchesLookGender(garment, gender) {
  if (!gender) return true;
  if (garment.genders.includes(gender) || garment.genders.includes("shared")) return true;
  if (gender === "men" && garment.sex === "male") return true;
  if (gender === "women" && garment.sex === "female") return true;
  return false;
}

export function garmentsForLook(slug, gender, categoryId) {
  const list = garmentsForBrand(slug).filter((g) => g.category === categoryId);
  if (!gender) return list;
  return [...list].sort(
    (a, b) => Number(matchesLookGender(b, gender)) - Number(matchesLookGender(a, gender))
  );
}

export function fitForGarment(garment, pageGender) {
  if (!garment) return pageGender || "";
  if (garment.sex === "male") return "men";
  if (garment.sex === "female") return "women";
  if (garment.genders.includes("shared")) return "shared";
  if (garment.genders.length === 1) return garment.genders[0];
  if (pageGender && garment.genders.includes(pageGender)) return pageGender;
  return garment.genders.find((g) => g !== "shared") || pageGender || "";
}

function catalogGenderSet(value) {
  if (value === "shared" || value === "unisex") return new Set(["shared", "unisex"]);
  return new Set([value]);
}

export function matchCatalogProduct(products, garment, gender) {
  const list = products || [];
  const bySlug = list.find(
    (p) => p.sku_kind === "category" && p.slug === garment.id
  );
  if (bySlug) return bySlug;
  const wantedGender =
    gender || (garment.genders.includes("shared") ? "shared" : garment.genders[0]);
  const wanted = catalogGenderSet(wantedGender);
  return (
    list.find(
      (p) =>
        p.sku_kind === "category" &&
        p.category === garment.category &&
        wanted.has(p.gender)
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
