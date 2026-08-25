import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import Home from "./pages/Home";
import About from "./pages/About";
import People from "./pages/People";
import Awards from "./pages/Awards";
import Services from "./pages/Services";
import Process from "./pages/Process";
import Work from "./pages/Work";
import Project from "./pages/Project";
import Lookbook from "./pages/Lookbook";
import Start from "./pages/Start";
import Login from "./pages/Login";
import Studio from "./pages/Studio";
import Admin from "./pages/Admin";
import Guard from "./pages/Guard";
import { clearSession, fetchMe, getStoredUser, getToken, setSession } from "./api";

function getPath() {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  return hash.startsWith("/") ? hash : `/${hash}`;
}

export default function App() {
  const [path, setPath] = useState(getPath);
  const [user, setUser] = useState(() => (getToken() ? getStoredUser() : null));

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

  useEffect(() => {
    if (!getToken()) return;
    fetchMe()
      .then((data) => {
        setSession(getToken(), data.user);
        setUser(data.user);
      })
      .catch(() => {
        clearSession();
        setUser(null);
      });
  }, []);

  const login = (next) => {
    setUser(next);
  };

  const logout = () => {
    clearSession();
    setUser(null);
    window.location.hash = "#/";
  };

  let page;
  const workParts = path.split("/").filter(Boolean);

  if (workParts[0] === "work" && workParts[1]) {
    const slug = decodeURIComponent(workParts[1]);
    const gender = workParts[2] === "men" || workParts[2] === "women" ? workParts[2] : null;
    const categoryId = gender ? workParts[3] : workParts[2];

    if (categoryId) {
      page = <Lookbook slug={slug} gender={gender} categoryId={categoryId} />;
    } else {
      page = <Project slug={slug} />;
    }
  } else {
    switch (path) {
      case "/about":
        page = <About />;
        break;
      case "/people":
        page = <People />;
        break;
      case "/awards":
        page = <Awards />;
        break;
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
      case "/login":
        page = <Login user={user} onLogin={login} />;
        break;
      case "/studio":
      case "/account":
        page = (
          <Guard user={user} role="client">
            <Studio user={user} onLogout={logout} />
          </Guard>
        );
        break;
      case "/admin":
        page = (
          <Guard user={user} role="admin">
            <Admin user={user} onLogout={logout} />
          </Guard>
        );
        break;
      default:
        page = <Home />;
    }
  }

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Navbar path={path} user={user} onLogout={logout} />
      <main id="main">{page}</main>
      <Footer />
      <BackToTop />
    </>
  );
}
