const MARK = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.35",
  strokeLinecap: "butt",
  strokeLinejoin: "miter",
  strokeMiterlimit: "2.5",
  "aria-hidden": true,
  focusable: "false",
};

function Mark({ children }) {
  return <svg {...MARK}>{children}</svg>;
}

export function MarkHead() {
  return (
    <Mark>
      <circle cx="24" cy="24" r="13.5" />
      <line x1="12.8" y1="16.5" x2="35.2" y2="16.5" />
    </Mark>
  );
}

export function MarkEyes() {
  return (
    <Mark>
      <path d="M5.5 24 L14 19.25 L22.5 24 L14 28.75 Z" />
      <path d="M25.5 24 L34 19.25 L42.5 24 L34 28.75 Z" />
    </Mark>
  );
}

export function MarkEar() {
  return (
    <Mark>
      <path d="M39 22 A15 15 0 0 1 24 37 A15 15 0 0 1 9 22 A10 10 0 0 1 19 12 A6 6 0 0 1 25 18 A4 4 0 0 1 21 22" />
    </Mark>
  );
}

export function MarkHands() {
  return (
    <Mark>
      <path d="M12 36 V12 H31" />
      <path d="M36 12 V36 H17" />
    </Mark>
  );
}

export function MarkSpine() {
  return (
    <Mark>
      <line x1="14" y1="8.5" x2="34" y2="8.5" />
      <line x1="14" y1="16.25" x2="34" y2="16.25" />
      <line x1="14" y1="24" x2="34" y2="24" />
      <line x1="14" y1="31.75" x2="34" y2="31.75" />
      <line x1="14" y1="39.5" x2="34" y2="39.5" />
    </Mark>
  );
}

export function MarkDesign() {
  return (
    <Mark>
      <path d="M17 16 L11 20.5 L13.5 24 L17 21.5 V36.5 H31 V21.5 L34.5 24 L37 20.5 L31 16 C29.2 12.4 18.8 12.4 17 16 Z" />
      <path d="M33.5 33.5 L40 27 L42 29 L35.5 35.5 Z" />
      <line x1="40.6" y1="26.4" x2="43.2" y2="23.8" />
    </Mark>
  );
}

export function MarkSourcing() {
  return (
    <Mark>
      <ellipse cx="13" cy="24" rx="5" ry="11.5" />
      <path d="M13 12.5 H33" />
      <path d="M13 35.5 H33" />
      <ellipse cx="33" cy="24" rx="5" ry="11.5" />
      <path d="M33 12.5 Q42 18 34 24 Q42 30 33 35.5" />
    </Mark>
  );
}

export function MarkSample() {
  return (
    <Mark>
      <circle cx="24" cy="9.5" r="2.6" />
      <path d="M18 14.5 C18 12.2 30 12.2 30 14.5 L28.5 32.5 C27.4 36.2 20.6 36.2 19.5 32.5 Z" />
      <line x1="24" y1="36.2" x2="24" y2="42" />
      <line x1="18.5" y1="42" x2="29.5" y2="42" />
    </Mark>
  );
}

export function MarkProduction() {
  return (
    <Mark>
      <rect x="7.5" y="32" width="33" height="6.5" />
      <path d="M12 32 V16.5 H34.5 V23.5 H22.5 V32" />
      <line x1="34.5" y1="23.5" x2="34.5" y2="32" />
      <circle cx="18.5" cy="12" r="3.2" />
      <line x1="18.5" y1="15.2" x2="18.5" y2="16.5" />
    </Mark>
  );
}

export function MarkQuality() {
  return (
    <Mark>
      <path d="M24 7.5 V11" />
      <path d="M14 14.5 L24 11 L34 14.5" />
      <path d="M14 14.5 L10 18 L13.5 20.5 L17 18 V36.5 H31 V18 L34.5 20.5 L38 18 L34 14.5" />
      <path d="M9.5 26.5 H38.5" />
      <path d="M12 26.5 V29" />
      <path d="M18 26.5 V28.4" />
      <path d="M24 26.5 V29" />
      <path d="M30 26.5 V28.4" />
      <path d="M36 26.5 V29" />
    </Mark>
  );
}

export function MarkDispatch() {
  return (
    <Mark>
      <rect x="10" y="16" width="28" height="22" />
      <rect x="10" y="11.5" width="28" height="4.5" />
      <path d="M24 11.5 V38" />
      <path d="M10 27 H38" />
    </Mark>
  );
}
