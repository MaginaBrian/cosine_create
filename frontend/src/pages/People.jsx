import "./Essay.css";
import "./People.css";

const ROLES = [
  {
    id: "head",
    title: "The Head",
    image: "/people/head.jpg",
    alt: "Fabric swatches, scissors and a project notebook on the studio table",
    body: "This is where it started. Three years in, but the role has always been about seeing the whole shape of a project before it begins, sourcing and buying, creative direction, pricing, supply chain and logistics that make an idea actually deliverable. Knows fabrics across garment types well enough to know what\u2019s possible before a client hears \u201cno.\u201d Works across athleisure, casual, sportswear, women\u2019s and men\u2019s wear, and sits in on the sampling conversation alongside The Ear and The Spine, because the shape of a project doesn\u2019t stop being the founder\u2019s problem once design starts.",
  },
  {
    id: "eyes",
    title: "The Eyes",
    image: "/people/eyes.jpg",
    alt: "A garment production floor with sewing machines and hanging work in progress",
    body: "Eight years in operations between them, watching over the process so nothing slips between stages. ISO-certified, with a working command of operational efficiency, strategy, sustainability and partnership. The ones who keep a client relationship steady and keep the standard defensible when it\u2019s questioned. Alongside The Spine, they oversee production timelines and floor supervision, making sure what\u2019s promised at the start of a project is what actually arrives at the end.",
  },
  {
    id: "ear",
    title: "The Ear",
    image: "/people/ear.jpg",
    alt: "Pattern paper, rulers and a muslin toile on a dress form",
    body: "Nine years in the room listening to what a client means before it becomes a garment. Trained across fashion design and pattern making, with the technical range to take a brief from sketch to tech pack \u2014 2D and 3D design, Illustrator, print and finishing and knowledge that stretches as far as sports shoe design. Comfortable across athleisure, streetwear, loungewear, casual and sportswear. Alongside The Head and The Spine, they carry the sampling conversation with clients through to fit and revision.",
  },
  {
    id: "hands",
    title: "The Hands",
    image: "/people/hands.jpg",
    alt: "A tailor guiding fabric under an industrial sewing machine",
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
              <p>{body}</p>
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
