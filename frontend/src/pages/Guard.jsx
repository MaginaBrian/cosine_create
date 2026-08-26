import { useEffect } from "react";
import { clientHome } from "../clientHome";

export default function Guard({ user, role, children }) {
  useEffect(() => {
    if (!user) {
      window.location.hash = "#/login";
      return;
    }
    if (role && user.role !== role) {
      window.location.hash = clientHome(user);
    }
  }, [user, role]);

  if (!user) return null;
  if (role && user.role !== role) return null;
  return children;
}
