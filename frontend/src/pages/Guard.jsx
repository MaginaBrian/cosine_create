import { useEffect } from "react";

export default function Guard({ user, role, children }) {
  useEffect(() => {
    if (!user) {
      window.location.hash = "#/login";
      return;
    }
    if (role && user.role !== role) {
      window.location.hash = user.role === "admin" ? "#/admin" : "#/studio";
    }
  }, [user, role]);

  if (!user) return null;
  if (role && user.role !== role) return null;
  return children;
}
