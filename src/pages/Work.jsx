import WorkGrid from "../components/WorkGrid";
import { PROJECTS } from "../data";

export default function Work() {
  return (
    <section className="home-work">
      <WorkGrid projects={PROJECTS} />
    </section>
  );
}

