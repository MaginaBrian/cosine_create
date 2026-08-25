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
      <rect x="11.5" y="11.5" width="25" height="25" />
      <line x1="11.5" y1="11.5" x2="36.5" y2="36.5" />
    </Mark>
  );
}

export function MarkSourcing() {
  return (
    <Mark>
      <circle cx="17" cy="24" r="11.5" />
      <circle cx="31" cy="24" r="11.5" />
    </Mark>
  );
}

export function MarkSample() {
  return (
    <Mark>
      <rect x="10.5" y="10.5" width="20" height="20" />
      <rect x="17.5" y="17.5" width="20" height="20" />
    </Mark>
  );
}

export function MarkProduction() {
  return (
    <Mark>
      <line x1="13.5" y1="10" x2="13.5" y2="38" />
      <line x1="24" y1="10" x2="24" y2="38" />
      <line x1="34.5" y1="10" x2="34.5" y2="38" />
    </Mark>
  );
}

export function MarkQuality() {
  return (
    <Mark>
      <path d="M10.5 20.5 V10.5 H20.5" />
      <path d="M27.5 10.5 H37.5 V20.5" />
      <path d="M37.5 27.5 V37.5 H27.5" />
      <path d="M20.5 37.5 H10.5 V27.5" />
    </Mark>
  );
}

export function MarkDispatch() {
  return (
    <Mark>
      <path d="M38.5 11.5 H13.5 V36.5 H38.5" />
    </Mark>
  );
}
