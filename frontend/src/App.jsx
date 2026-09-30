import { lazy, Suspense, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import Guard from "./pages/Guard";
import Home from "./pages/Home";
import {
  loadAbout,
  loadAdmin,
  loadAwards,
  loadLogin,
  loadLookbook,
  loadPeople,
  loadProcess,
  loadProject,
  loadServices,
  loadStart,
  loadStudio,
  loadTextileKind,
  loadWork,
} from "./loadPage";
import { clearSession, fetchMe, getStoredUser, getToken, setSession } from "./api";

const About = lazy(loadAbout);
const People = lazy(loadPeople);
const Awards = lazy(loadAwards);
const Services = lazy(loadServices);
const Process = lazy(loadProcess);
const Work = lazy(loadWork);
const Project = lazy(loadProject);
const Lookbook = lazy(loadLookbook);
const TextileKind = lazy(loadTextileKind);
const Start = lazy(loadStart);
const Login = lazy(loadLogin);
const Studio = lazy(loadStudio);
const Admin = lazy(loadAdmin);

function getPath() {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  const withSlash = hash.startsWith("/") ? hash : `/${hash}`;
  return withSlash.split("?")[0];
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

    if (slug === "cosine-textiles" && workParts[2]) {
      page = <TextileKind kindSlug={decodeURIComponent(workParts[2])} user={user} />;
    } else if (categoryId) {
      page = <Lookbook slug={slug} gender={gender} categoryId={categoryId} user={user} />;
    } else {
      page = <Project slug={slug} user={user} />;
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
          <Guard user={user} role={["admin", "produce", "dispatch"]}>
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
      <main id="main">
        <Suspense fallback={<div className="page-pending" aria-busy="true" />}>{page}</Suspense>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
