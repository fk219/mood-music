import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import "../styles/login.scss";
import FormGroup from "../components/FormGroup";
import { useAuth } from "../hook/useAuth";
import { getAuthErrorMessage } from "../utils/getAuthError";
import { AlertIcon } from "../../shared/components/Icons";

const Login = () => {
  const { user, loading, handleLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    setError("");

    try {
      await handleLogin({ email, password });
    } catch (submitError) {
      setError(
        getAuthErrorMessage(
          submitError,
          "That email and password didn’t match. Try again.",
        ),
      );
    }
  };

  if (user) return <Navigate to="/" replace />;

  return (
    <main className="auth-page login-page">
      <section className="auth-card" aria-labelledby="login-title">
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

        {error && (
          <div className="auth-alert" role="alert">
            <AlertIcon />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} aria-busy={loading}>
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
            {loading && <span className="auth-spinner" aria-hidden="true" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          New to Moodify? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
