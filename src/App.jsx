import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Process from "./pages/Process";
import Work from "./pages/Work";
import Start from "./pages/Start";
import Portal from "./pages/Portal";

function getPath() {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  return hash.startsWith("/") ? hash : `/${hash}`;
}

export default function App() {
  const [path, setPath] = useState(getPath);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cc-user")) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const onHash = () => {
      setPath(getPath());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash) {
      window.location.hash = "#/";
    }
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const login = (next) => {
    localStorage.setItem("cc-user", JSON.stringify(next));
    setUser(next);
  };

  const logout = () => {
    localStorage.removeItem("cc-user");
    setUser(null);
  };

  let page;
  switch (path) {
    case "/services":
      page = <Services />;
      break;
    case "/process":
      page = <Process />;
      break;
    case "/work":
      page = <Work />;
      break;
    case "/start":
      page = <Start />;
      break;
    case "/portal":
      page = <Portal user={user} onLogin={login} onLogout={logout} />;
      break;
    default:
      page = <Home />;
  }

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Navbar path={path} user={user} />
      <main id="main">{page}</main>
      <Footer />
      <BackToTop />
    </>
  );
}
