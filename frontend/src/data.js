export const SLIDES = [
  { src: "/work/atelier.jpg", alt: "Atelier — first sample run" },
  { src: "/work/northline.jpg", alt: "Northline — shell in production" },
  { src: "/work/harbour.jpg", alt: "Harbour — tote on the bench" },
  { src: "/work/field.jpg", alt: "Field Notes — uniform rail" },
  { src: "/work/solace.jpg", alt: "Solace — knit in the sample room" },
  { src: "/work/kora.jpg", alt: "Kora — accessories still life" },
];

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

export const PROJECTS = [
  {
    name: "Atelier Tee",
    client: "Atelier",
    stage: "Sampling",
    qty: "48 pcs",
    year: "2026",
    image: "/work/atelier.jpg",
    note: "Three fabric options sourced. Fit sample turned in twelve days, then a first run under fifty.",
  },
  {
    name: "Northline Shell",
    client: "Northline",
    stage: "Sourcing",
    qty: "120 pcs",
    year: "2026",
    image: "/work/northline.jpg",
    note: "Membrane and lining paired for weather, hand and cost — a first production under 150 units.",
  },
  {
    name: "Harbour Tote",
    client: "Harbour",
    stage: "Production",
    qty: "200 pcs",
    year: "2025",
    image: "/work/harbour.jpg",
    note: "Canvas sourced, hardware specified, construction locked in sample, then a clean production run.",
  },
  {
    name: "Field Notes Uniform",
    client: "Field Notes",
    stage: "Distribution",
    qty: "80 pcs",
    year: "2026",
    image: "/work/field.jpg",
    note: "Spec to packed delivery for two locations. Same pattern, two size runs, one QC standard.",
  },
  {
    name: "Solace Knit",
    client: "Solace",
    stage: "Sampling",
    qty: "36 pcs",
    year: "2025",
    image: "/work/solace.jpg",
    note: "Yarn and gauge decided in sampling. A small knit run to prove the silhouette before scaling.",
  },
  {
    name: "Kora Goods",
    client: "Kora",
    stage: "Produce",
    qty: "90 pcs",
    year: "2026",
    image: "/work/kora.jpg",
    note: "Leather alternative sourced, edge finish resolved in sample, then a low-quantity production.",
  },
];

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
