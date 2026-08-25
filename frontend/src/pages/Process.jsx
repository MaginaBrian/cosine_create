import "./Essay.css";
import "./Process.css";
import {
  MarkDesign,
  MarkSourcing,
  MarkSample,
  MarkProduction,
  MarkQuality,
  MarkDispatch,
} from "../components/Marks";

const STAGES = [
  {
    id: "design",
    title: "Design",
    Mark: MarkDesign,
    body: "You bring what you're trying to make. A sketch, a reference piece, sometimes just a rough idea of the fit you want. We turn that into something a production floor can actually build from. If you don't have a tech pack, that's fine, most founders don't. We create it with you.",
  },
  {
    id: "sourcing",
    title: "Sourcing",
    Mark: MarkSourcing,
    body: "We source our own fabric and trims. Most manufacturers won't touch sourcing at low order quantities because it's more work for less payoff, they push it back onto the client, or they use whatever's sitting in stock. We didn't build the business that way.",
  },
  {
    id: "sample",
    title: "Sample",
    Mark: MarkSample,
    body: "Nothing goes to production until you've held the sample. Fabric hand, fit, construction. You feel it before it exists at scale. Most of the expensive mistakes in this industry happen because someone signed off on a sample too quickly.",
  },
  {
    id: "production",
    title: "Production",
    Mark: MarkProduction,
    body: "We cut and sew at the quantity you actually need, not the quantity that makes a factory's week easier. Small runs take more attention per piece and that's the trade we've built around.",
  },
  {
    id: "quality",
    title: "Quality",
    Mark: MarkQuality,
    body: "Every piece gets checked before it leaves. Quality for us isn't a stage we get to at the end, it's something we're doing the whole time.",
  },
  {
    id: "dispatch",
    title: "Dispatch",
    Mark: MarkDispatch,
    body: "Packed and shipped the way you need it. Whether that's to you, or straight to your own customer.",
  },
];

export default function Process() {
  return (
    <article className="essay process">
      <h1>Process</h1>
      <div className="process__stages">
        {STAGES.map(({ id, title, Mark, body }) => (
          <section key={id} className="process__stage">
            <div className="process__mark">
              <Mark />
            </div>
            <h2>{title}</h2>
            <p>{body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
