import Logo from "./Logo";
import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="footer">
      <div className="container">
        <div className="footer__top">
          <h2 className="footer__cta">
            Ready to
            <br />
            make it?
          </h2>
          <a className="btn btn--invert" href="#/start">
            Start a project
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path d="M2 7.5h11M8 2l5.5 5.5L8 13" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </a>
        </div>

        <div className="footer__grid">
          <div className="footer__col">
            <p className="eyebrow">Studio</p>
            <p>Contract manufacturing</p>
            <p>From first sample to full run</p>
          </div>
          <div className="footer__col">
            <p className="eyebrow">Explore</p>
            <a href="#/" className="link">Work</a>
            <a href="#/about" className="link">About</a>
            <a href="#/process" className="link">Process</a>
            <a href="#/people" className="link">People</a>
          </div>
          <div className="footer__col">
            <p className="eyebrow">Contact</p>
            <a className="link" href="mailto:hello@cosinecreate.com">hello@cosinecreate.com</a>
            <a className="link" href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
            <a className="link" href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </div>

        <a href="#/" className="footer__lockup" aria-label="Cosine Create">
          <Logo />
        </a>

        <div className="footer__bar">
          <span>© {year} Cosine Create</span>
          <span>Every project, the same care.</span>
        </div>
      </div>
    </footer>
  );
}
