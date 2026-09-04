import "./Essay.css";
import "./People.css";

const ROLES = [
  {
    id: "head",
    title: "The Head",
    image: "/people/head.jpg",
    alt: "Fabric swatches, scissors and a project notebook on the studio table",
    body: [
      "Three years in. Sees the whole shape of a project before it begins: sourcing, creative direction, pricing, supply chain and logistics.",
      "Sources all the raw materials and knows fabrics across garment types well enough to say what's possible early. Works across athleisure, casual, sportswear, women's and men's wear, and sits in on sampling alongside The Ear and The Spine, because the shape of a project stays the founder's responsibility even after design starts.",
    ],
  },
  {
    id: "eyes",
    title: "The Eyes",
    image: "/people/vision.jpg",
    alt: "A studio lead looking ahead, the work in focus behind her",
    body: [
      "Nine years in operations, between them, watching over the process so nothing slips between stages. Operational efficiency, strategy, sustainability and partnerships, ISO-certified.",
      "The ones who keep a client relationship steady and the standard defensible when it's questioned. Alongside The Spine, they oversee production timelines and floor supervision.",
    ],
  },
  {
    id: "ear",
    title: "The Ear",
    image: "/people/ear.jpg",
    alt: "An African fashion designer drafting a pattern at a studio table",
    body: [
      "Seven years in the room listening to what a client means before it becomes a garment. Trained across fashion design and pattern making, with the range to take a brief from sketch to tech pack.",
      "2D and 3D design, Illustrator, print and finishing, and knowledge that stretches as far as sports shoe design. Comfortable across athleisure, streetwear, loungewear, casual and sportswear. Alongside The Head and The Spine, this team carries the sampling conversation with clients through to fit and revision.",
    ],
  },
  {
    id: "hands",
    title: "The Hands",
    image: "/people/eyes.jpg",
    alt: "African garment workers at sewing stations on a production floor",
    body: "A decade of making, shared across the floor. Stitching and sample making across the full range, athleisure, casual, sportswear, tailoring, technical garments, women\u2019s and men\u2019s wear. The kind of range that comes from years of being handed almost anything and being expected to build it properly. Hand-finishing, working from a tech pack independently and mentoring newer tailors coming up through the floor.",
  },
  {
    id: "spine",
    title: "The Spine",
    image: "/people/spine.jpg",
    alt: "Pattern pieces pinned to fabric on a cutting table with tailor shears",
    body: "Thirteen years of holding a garment together, pattern to finished piece. Pattern making, cutting, grading, stitching and quality control all sit within this team, with the range to move between casual wear and technical tailoring \u2014 suits, structured menswear, womenswear, and technical garments that need more precision than a standard cut allows. Branding is folded in too, so the finish carries the client\u2019s identity as much as the construction does. Alongside The Eyes, they keep production on schedule and the floor running.",
  },
];

export default function People() {
  return (
    <article className="essay people">
      <h1>People</h1>
      <div className="people__roles">
        {ROLES.map(({ id, title, image, alt, body }) => (
          <section key={id} className="people__role">
            <img className="people__bg" src={image} alt={alt} />
            <div className="people__copy">
              <h2>{title}</h2>
              {(Array.isArray(body) ? body : [body]).map((para) => (
                <p key={para}>{para}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
