const MARK = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.35",
  strokeLinecap: "butt",
  strokeLinejoin: "miter",
  strokeMiterlimit: "2",
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
      <line x1="14.5" y1="18" x2="33.5" y2="18" />
    </Mark>
  );
}

export function MarkEyes() {
  return (
    <Mark>
      <path d="M5.5 24 L14.25 19.5 L23 24 L14.25 28.5 Z" />
      <path d="M25 24 L33.75 19.5 L42.5 24 L33.75 28.5 Z" />
    </Mark>
  );
}

export function MarkEar() {
  return (
    <Mark>
      <path d="M32.5 9.5 A14.5 14.5 0 1 0 32.5 38.5 A7.5 7.5 0 1 0 32.5 23.5" />
    </Mark>
  );
}

export function MarkHands() {
  return (
    <Mark>
      <path d="M12 36.5 V11.5 H33" />
      <path d="M36 11.5 V36.5 H15" />
    </Mark>
  );
}

export function MarkSpine() {
  return (
    <Mark>
      <line x1="18" y1="8" x2="30" y2="8" />
      <line x1="18" y1="16" x2="30" y2="16" />
      <line x1="18" y1="24" x2="30" y2="24" />
      <line x1="18" y1="32" x2="30" y2="32" />
      <line x1="18" y1="40" x2="30" y2="40" />
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
      <path d="M28.5 11.5 A12.5 12.5 0 1 0 28.5 36.5" />
      <path d="M19.5 11.5 A12.5 12.5 0 1 1 19.5 36.5" />
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
      <line x1="14" y1="10" x2="14" y2="38" />
      <line x1="24" y1="10" x2="24" y2="38" />
      <line x1="34" y1="10" x2="34" y2="38" />
    </Mark>
  );
}

export function MarkQuality() {
  return (
    <Mark>
      <path d="M10.5 18.5 V10.5 H18.5" />
      <path d="M29.5 10.5 H37.5 V18.5" />
      <path d="M37.5 29.5 V37.5 H29.5" />
      <path d="M18.5 37.5 H10.5 V29.5" />
    </Mark>
  );
}

export function MarkDispatch() {
  return (
    <Mark>
      <path d="M36.5 11.5 H11.5 V36.5 H36.5" />
    </Mark>
  );
}
