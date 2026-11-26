import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import "../styles/login.scss";
import FormGroup from "../components/FormGroup";
import { useAuth } from "../hook/useAuth";
import { getAuthErrorMessage } from "../utils/getAuthError";
import { AlertIcon } from "../../shared/components/Icons";
import SiteFooter from "../../shared/components/SiteFooter";

const getDemoErrorMessage = (error) => {
  const status = error?.response?.status;
  const serverMessage = error?.response?.data?.message;
  const hasServerMessage =
    typeof serverMessage === "string" && serverMessage.trim().length > 0;

  if (hasServerMessage && (status === 429 || status >= 500)) {
    return serverMessage;
  }

  return "The demo room could not open. Try again in a moment.";
};

const Login = () => {
  const { user, loading, handleLogin, handleDemoLogin, clearSession } =
    useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [demoError, setDemoError] = useState("");
  const [formBusy, setFormBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const clearedStaleSession = useRef(false);

  const notice = location.state?.notice || "";

  useEffect(() => {
    if (!notice || !user || clearedStaleSession.current) return;

    clearedStaleSession.current = true;
    clearSession();
  }, [notice, user, clearSession]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    // A new sign-in replaces any stale session the notice was clearing.
    clearedStaleSession.current = true;
    setError("");
    setFormBusy(true);

    try {
      await handleLogin({ email, password });
      navigate("/", { replace: true });
    } catch (submitError) {
      setError(
        getAuthErrorMessage(
          submitError,
          "That email and password didn’t match. Try again.",
        ),
      );
    } finally {
      setFormBusy(false);
    }
  };

  const handleDemo = async () => {
    if (loading) return;

    // A new session replaces any stale session the notice was clearing.
    clearedStaleSession.current = true;
    setDemoError("");
    setDemoBusy(true);

    try {
      await handleDemoLogin();
      navigate("/", { replace: true });
    } catch (demoOpenError) {
      setDemoError(getDemoErrorMessage(demoOpenError));
    } finally {
      setDemoBusy(false);
    }
  };

  if (user && !notice) return <Navigate to="/" replace />;

  return (
    <div className="auth-page login-page">
      <main className="login-shell" aria-labelledby="login-title">
        <section className="login-intro">
          <div className="login-brand">
            <span className="login-brand__ring" aria-hidden="true" />
            <span className="login-brand__name">MoodMusic</span>
            <span className="login-brand__tag">Listening room</span>
          </div>

          <div className="login-intro__copy">
            <p className="eyebrow">The listening room</p>
            <h1 id="login-title">Step into the room.</h1>
            <p className="login-intro__lead">
              Music apps ask for a genre. MoodMusic asks how you feel. Mood
              detection runs on your device, or you can check in manually, and
              your journal stays private.
            </p>
            <p className="login-intro__note">
              The camera is optional. The manual mood picker works without it.
            </p>
          </div>

          <div className="login-door" aria-hidden="true">
            <span className="login-door__glow" />
            <span className="login-door__frame">
              <span className="login-door__seam" />
              <span className="login-door__disc" />
              <span className="login-door__handle" />
            </span>
            <span className="login-door__floor" />
          </div>

          <ul className="login-notes">
            <li>On-device mood detection</li>
            <li>A private weekly journal</li>
            <li>The demo opens in one click</li>
          </ul>
        </section>

        <section className="login-panel" aria-labelledby="login-panel-title">
          <header className="login-panel__head">
            <p className="eyebrow">Welcome back</p>
            <h2 id="login-panel-title">The room kept your seat warm.</h2>
            <p>
              Open the demo room first, or sign in to your own listening room and
              journal.
            </p>
          </header>

          {notice && (
            <div className="auth-notice" role="status">
              <span className="auth-notice__dot" aria-hidden="true" />
              <span>{notice}</span>
            </div>
          )}

          <div className="login-demo" aria-busy={demoBusy}>
            <div className="login-demo__top">
              <span className="login-demo__badge">No account needed</span>
              <span className="login-demo__shared">Shared listening room</span>
            </div>
            <button
              type="button"
              className="button login-demo__button"
              onClick={handleDemo}
              disabled={loading}
            >
              {demoBusy && <span className="auth-spinner" aria-hidden="true" />}
              {demoBusy ? "Opening the demo room…" : "Enter the demo room"}
            </button>
            <p className="login-demo__hint">
              One click opens a shared listening room. The camera stays optional
              and the manual picker works without it.
            </p>
            {demoError && (
              <div className="auth-alert login-demo__alert" role="alert">
                <AlertIcon />
                <span>{demoError}</span>
              </div>
            )}
          </div>

          <p className="auth-divider">
            <span>or sign in with your account</span>
          </p>

          {error && (
            <div className="auth-alert login-form__alert" role="alert">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form login-form" onSubmit={handleSubmit} aria-busy={formBusy}>
            <FormGroup
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
            />
            <FormGroup
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              disabled={loading}
            />

            <button
              type="submit"
              className="button auth-submit auth-submit--quiet"
              disabled={loading}
            >
              {formBusy && <span className="auth-spinner" aria-hidden="true" />}
              {formBusy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="auth-footer login-footer">
            New to MoodMusic? <Link to="/register">Create an account</Link>
          </p>
        </section>
      </main>

      <SiteFooter compact />
    </div>
  );
};

export default Login;
