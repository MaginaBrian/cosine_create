import { useEffect } from "react";
import { clientHome } from "../clientHome";

export default function Studio({ user }) {
  useEffect(() => {
    window.location.hash = clientHome(user);
  }, [user]);

  return null;
}
