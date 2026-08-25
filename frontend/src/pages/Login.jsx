import { useEffect, useState } from "react";
import { loginRequest, setSession } from "../api";
import "./Portal.css";

export default function Login({ user, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    window.location.hash = user.role === "admin" ? "#/admin" : "#/studio";
  }, [user]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await loginRequest(email, password);
      setSession(data.token, data.user);
      onLogin(data.user);
      window.location.hash = data.user.role === "admin" ? "#/admin" : "#/studio";
    } catch (err) {
      setError(err.message || "Could not sign in");
    } finally {
      setBusy(false);
    }
  };

  if (user) return null;

  return (
    <>
      <header className="page-head">
        <div className="container">
          <p className="eyebrow">Client access</p>
          <h1>Sign in to your studio.</h1>
          <p className="page-head__lede">
            Clients order against their own catalog. The public site stays public — this is only for the work in motion.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container portal-login">
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error ? <p className="portal-login__hint">{error}</p> : null}
            <button className="btn" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Enter studio"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
