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
      <main className="auth-card" aria-labelledby="login-title">
        <div className="auth-brand">
          <span className="auth-brand__ring" aria-hidden="true" />
          <span className="auth-brand__name">Moodify</span>
          <span className="auth-brand__tag">Listening room</span>
        </div>

        <div className="auth-heading">
          <p className="eyebrow">Sign in</p>
          <h1 id="login-title">Welcome back.</h1>
          <p>The room kept your seat warm.</p>
        </div>

        <section className="auth-promise" aria-label="Why Moodify">
          <p>
            Music apps ask for a genre. Moodify asks how you feel. Mood detection
            runs on your device, or you can check in manually, and your journal
            stays private.
          </p>
          <p className="auth-promise__note">
            The camera is optional. The manual mood picker works without it.
          </p>
        </section>

        {notice && (
          <div className="auth-notice" role="status">
            <span className="auth-notice__dot" aria-hidden="true" />
            <span>{notice}</span>
          </div>
        )}

        {error && (
          <div className="auth-alert" role="alert">
            <AlertIcon />
            <span>{error}</span>
          </div>
        )}

        <div className="auth-demo" aria-busy={demoBusy}>
          <p className="auth-demo__eyebrow">No account needed</p>
          <button
            type="button"
            className="button auth-demo__button"
            onClick={handleDemo}
            disabled={loading}
          >
            {demoBusy && <span className="auth-spinner" aria-hidden="true" />}
            {demoBusy ? "Opening the demo room…" : "Enter the demo room"}
          </button>
          <p className="auth-demo__hint">
            One click opens a shared listening room. The camera stays optional
            and the manual picker works without it.
          </p>
          {demoError && (
            <div className="auth-alert auth-demo__alert" role="alert">
              <AlertIcon />
              <span>{demoError}</span>
            </div>
          )}
        </div>

        <p className="auth-divider">
          <span>or sign in</span>
        </p>

        <form className="auth-form" onSubmit={handleSubmit} aria-busy={formBusy}>
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

          <button type="submit" className="button auth-submit" disabled={loading}>
            {formBusy && <span className="auth-spinner" aria-hidden="true" />}
            {formBusy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          New to Moodify? <Link to="/register">Create an account</Link>
        </p>
      </main>

      <SiteFooter compact />
    </div>
  );
};

export default Login;
