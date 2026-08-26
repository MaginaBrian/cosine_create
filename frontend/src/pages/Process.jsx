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
    body: "You bring what you're trying to make. A sketch, a reference piece, sometimes just a rough idea of what it should look and feel like. We turn that into something a production floor can actually build from. If you don't have a tech pack, that's fine, most people don't. We create it with you.",
  },
  {
    id: "sourcing",
    title: "Sourcing",
    Mark: MarkSourcing,
    body: "We source our own fabric, trims and materials, matched to what the project needs. It's more work than sourcing at scale, which is exactly why we built the business to handle it ourselves rather than leave it to the client.",
  },
  {
    id: "sample",
    title: "Sample",
    Mark: MarkSample,
    body: "Nothing goes to production until you've approved the sample. Material, fit, construction, finish, checked and adjusted before a single unit is made. Most of the expensive mistakes in this industry happen because someone signed off too quickly.",
  },
  {
    id: "production",
    title: "Production",
    Mark: MarkProduction,
    body: "We build at the quantity you actually need. Small runs take more attention per piece, and that's the trade we've built the business around.",
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
      <ol className="process__stages">
        {STAGES.map(({ id, title, Mark, body }) => (
          <li key={id} className="process__stage">
            <div className="process__rail" aria-hidden="true">
              <div className="process__mark">
                <Mark />
              </div>
            </div>
            <div className="process__copy">
              <h2>{title}</h2>
              <p>{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}
