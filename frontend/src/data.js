export const STAGES = [
  {
    id: "01",
    key: "brief",
    name: "Brief",
    title: "A partner in the idea",
    body: "We start with what you want to make, who it is for, and the constraints that matter — quantity, hand-feel, cost, timeline. Creative thinking begins here, not after a spec is locked.",
  },
  {
    id: "02",
    key: "source",
    name: "Source",
    title: "Materials with intention",
    body: "Fabric and trim sourcing is part of the design. We match hand, weight and origin to the product — not a catalogue default — so the material decision is as considered as the silhouette.",
  },
  {
    id: "03",
    key: "sample",
    name: "Sample",
    title: "Prove it in the hand",
    body: "Sampling is where fit, construction and problem-solving happen. You see the work: toiles, comments, revisions. Trust is built before a production line is set.",
  },
  {
    id: "04",
    key: "produce",
    name: "Produce",
    title: "The same care, any quantity",
    body: "From a first run to a larger order, the line is set up around your project. Low minimums without lowering the standard — every unit is treated as if it were the sample.",
  },
  {
    id: "05",
    key: "distribute",
    name: "Distribute",
    title: "Out the door, on the record",
    body: "Finishing, QC, packing and dispatch are still your project. Labelled, checked and ready for your customer, stockist or warehouse — the last mile is not an afterthought.",
  },
];

export const SERVICES = [
  {
    id: "01",
    name: "Fabric sourcing",
    body: "Mills, merchants and trims selected for the product in front of us. Weight, hand, origin and cost are worked through together — not handed down from a stock list.",
  },
  {
    id: "02",
    name: "Sampling & development",
    body: "Patterns, toiles and fit samples with a clear comment loop. We solve construction in the sample room so production does not have to invent it later.",
  },
  {
    id: "03",
    name: "Cut, sew & production",
    body: "Low minimum order quantities with full production thinking. Lines are set around your project, whether the run is fifty units or five hundred.",
  },
  {
    id: "04",
    name: "Quality & finishing",
    body: "Press, trim, measurement and inspection against the approved sample. Finishing is part of the product, not a pass at the end of the line.",
  },
  {
    id: "05",
    name: "Packing & distribution",
    body: "Fold, pack, label and ship to the destinations you name. From the cutting table to the carton, the project stays in one pair of hands.",
  },
];

export const CLOTHING_CATEGORIES = [
  { id: "bottoms", label: "Bottoms" },
  { id: "tops", label: "Tops" },
];

export const SHARED_CATEGORIES = [
  { id: "hoodies", label: "Hoodies" },
  { id: "sweatshirts", label: "Sweatshirts" },
];

function emptyCategory() {
  return { cover: null, items: [] };
}

function emptyLooks() {
  const cats = () => ({
    bottoms: emptyCategory(),
    tops: emptyCategory(),
  });
  return {
    men: cats(),
    women: cats(),
    shared: { hoodies: emptyCategory(), sweatshirts: emptyCategory() },
  };
}

const mwotajiLooks = emptyLooks();
mwotajiLooks.women.tops = {
  cover: "/work/mwotaji/women/tops/cover.jpg",
  items: [
    {
      front: "/work/mwotaji/women/tops/01-front.jpg",
      back: "/work/mwotaji/women/tops/01-back.jpg",
    },
    {
      front: "/work/mwotaji/women/tops/02-front.jpg",
      back: "/work/mwotaji/women/tops/02-back.jpg",
    },
    {
      front: "/work/mwotaji/women/tops/03-front.jpg",
      back: "/work/mwotaji/women/tops/03-back.jpg",
    },
  ],
};
mwotajiLooks.women.bottoms = {
  cover: "/work/mwotaji/women/bottoms/cover.jpg",
  items: [
    {
      front: "/work/mwotaji/women/bottoms/01-front.jpg",
      back: "/work/mwotaji/women/bottoms/01-back.jpg",
    },
    {
      front: "/work/mwotaji/women/bottoms/02-front.jpg",
      back: "/work/mwotaji/women/bottoms/02-back.jpg",
    },
    {
      front: "/work/mwotaji/women/bottoms/03-front.jpg",
      back: "/work/mwotaji/women/bottoms/03-back.jpg",
    },
  ],
};
mwotajiLooks.men.tops = {
  cover: "/work/mwotaji/men/tops/cover.jpg",
  items: [
    {
      front: "/work/mwotaji/men/tops/01-front.jpg",
      back: "/work/mwotaji/men/tops/01-back.jpg",
    },
    {
      front: "/work/mwotaji/men/tops/02-front.jpg",
      back: "/work/mwotaji/men/tops/02-back.jpg",
    },
    {
      front: "/work/mwotaji/men/tops/03-front.jpg",
      back: "/work/mwotaji/men/tops/03-back.jpg",
    },
  ],
};
mwotajiLooks.men.bottoms = {
  cover: "/work/mwotaji/men/bottoms/cover.jpg",
  items: [
    {
      front: "/work/mwotaji/men/bottoms/01-front.jpg",
      back: "/work/mwotaji/men/bottoms/01-back.jpg",
    },
    {
      front: "/work/mwotaji/men/bottoms/02-front.jpg",
      back: "/work/mwotaji/men/bottoms/02-back.jpg",
    },
    {
      front: "/work/mwotaji/men/bottoms/03-front.jpg",
      back: "/work/mwotaji/men/bottoms/03-back.jpg",
    },
  ],
};
mwotajiLooks.shared.hoodies = {
  cover: "/work/mwotaji/hoodies/cover.jpg",
  items: [
    {
      front: "/work/mwotaji/hoodies/01-front.jpg",
      back: "/work/mwotaji/hoodies/01-back.jpg",
    },
    {
      front: "/work/mwotaji/hoodies/02-front.jpg",
    },
    {
      front: "/work/mwotaji/hoodies/03-front.jpg",
      back: "/work/mwotaji/hoodies/03-back.jpg",
    },
  ],
};
mwotajiLooks.shared.sweatshirts = {
  cover: "/work/mwotaji/sweatshirts/cover.jpg",
  items: [
    {
      front: "/work/mwotaji/sweatshirts/02-front.jpg",
    },
    {
      front: "/work/mwotaji/sweatshirts/03-front.jpg",
    },
    {
      front: "/work/mwotaji/sweatshirts/04-front.jpg",
    },
  ],
};

export const PROJECTS = [
  {
    slug: "cosine-create",
    name: "Studio",
    client: "Cosine Create",
    cardTitle: "Cosine Create\nComing Soon",
    hook: "Work from our own studio.",
    credit: "In house.",
    image: "/people/hands.jpg",
    looks: emptyLooks(),
  },
  {
    slug: "cosine-textiles",
    name: "Cosine Textiles",
    client: "Cosine Textiles",
    hook: "Fabric and textile work.",
    credit: "Work done for Cosine Textiles",
    image: "/work/solace.jpg",
    looks: emptyLooks(),
  },
  {
    slug: "mwotaji",
    name: "Essential Collection",
    client: "MWOTAJI",
    hook: "Essential Collection.",
    credit: "Work done for MWOTAJI",
    gallery: "https://envisionmedia33.pixieset.com/mwotajiessentialcollection/",
    image: "/work/mwotaji/cover.jpg",
    imageFit: "portrait",
    hero: "/work/mwotaji/hero.jpg",
    looks: mwotajiLooks,
  },
  {
    slug: "the-groove-hangout",
    name: "The Groove Hangout",
    client: "The Groove Hangout",
    hook: "A hospitality run.",
    credit: "Work done for The Groove Hangout",
    image: "/work/groove-hangout.jpg",
    heroVideo: "/videos/groove-hangout.mp4?v=2",
    looks: emptyLooks(),
  },
];

export function getProject(slug) {
  return PROJECTS.find((p) => p.slug === slug);
}

export function getLook(slug, gender, categoryId) {
  const project = getProject(slug);
  const category =
    CLOTHING_CATEGORIES.find((c) => c.id === categoryId) ||
    SHARED_CATEGORIES.find((c) => c.id === categoryId);
  const look = gender
    ? project?.looks?.[gender]?.[categoryId]
    : project?.looks?.shared?.[categoryId];
  if (!project || !category || !look) return null;
  return { project, gender, category, look };
}

export const ORDERS = [
  {
    id: "CC-2412",
    name: "Harbour Tote",
    qty: 200,
    stage: "produce",
    updated: "18 Aug 2026",
    note: "Line set. First 80 units through QC this week.",
  },
  {
    id: "CC-2408",
    name: "Atelier Tee",
    qty: 48,
    stage: "sample",
    updated: "12 Aug 2026",
    note: "Fit comments received. Second sample in work.",
  },
  {
    id: "CC-2388",
    name: "Field Notes Uniform",
    qty: 80,
    stage: "distribute",
    updated: "4 Aug 2026",
    note: "Packed for two destinations. Dispatch documents attached.",
  },
];
