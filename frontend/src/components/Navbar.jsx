import { useEffect, useState } from "react";
import Logo from "./Logo";
import "./Navbar.css";

const LINKS = [
  { href: "#/", label: "Work", match: "/" },
  { href: "#/about", label: "About", match: "/about" },
  { href: "#/process", label: "Process", match: "/process" },
  { href: "#/people", label: "People", match: "/people" },
];

function isCurrent(path, match) {
  if (match === "/") return path === "/" || path === "/work" || path.startsWith("/work/");
  return path === match;
}

export default function Navbar({ path }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="nav">
      <div className="nav__row">
        <nav className="nav__links" aria-label="Primary">
          <ul>
            {LINKS.map((l) => (
              <li key={l.match}>
                <a
                  href={l.href}
                  aria-current={isCurrent(path, l.match) ? "page" : undefined}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a href="#/" className="nav__brand" aria-label="Cosine Create — home" onClick={() => setOpen(false)}>
          <Logo />
        </a>

        <div className="nav__social">
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V23h-4V8zM8.5 8h3.8v2.05h.05c.53-1 1.83-2.05 3.77-2.05C20.4 8 22 10.2 22 14.02V23h-4v-8.02c0-1.91-.03-4.37-2.66-4.37-2.66 0-3.07 2.08-3.07 4.23V23h-4V8z" />
            </svg>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.2c3.2 0 3.6 0 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.25.07 1.63.07 4.81 0 3.19-.01 3.56-.07 4.81-.15 3.23-1.66 4.77-4.92 4.92-1.25.06-1.62.07-4.85.07-3.2 0-3.58 0-4.83-.07-3.26-.15-4.77-1.7-4.92-4.92-.06-1.25-.07-1.62-.07-4.81 0-3.18.01-3.56.07-4.81C2.35 3.96 3.87 2.42 7.1 2.27 8.35 2.2 8.8 2.2 12 2.2zm0 5.05a4.75 4.75 0 100 9.5 4.75 4.75 0 000-9.5zm0 7.83a3.08 3.08 0 110-6.16 3.08 3.08 0 010 6.16zm6.04-8.02a1.11 1.11 0 100-2.22 1.11 1.11 0 000 2.22z" />
            </svg>
          </a>
        </div>

        <button
          className="nav__toggle"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>

      <div className={`nav__mobile ${open ? "is-open" : ""}`}>
        <nav className="container" aria-label="Mobile">
          <ul>
            {LINKS.map((l) => (
              <li key={l.match}>
                <a
                  href={l.href}
                  aria-current={isCurrent(path, l.match) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
