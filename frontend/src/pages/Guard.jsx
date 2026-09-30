import { useEffect } from "react";
import { clientHome } from "../clientHome";

function roleAllowed(user, role) {
  if (!role) return true;
  const allowed = Array.isArray(role) ? role : [role];
  return allowed.includes(user.role);
}

export default function Guard({ user, role, children }) {
  useEffect(() => {
    if (!user) {
      window.location.hash = "#/login";
      return;
    }
    if (!roleAllowed(user, role)) {
      window.location.hash = clientHome(user);
    }
  }, [user, role]);

  if (!user) return null;
  if (!roleAllowed(user, role)) return null;
  return children;
}
