import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import "../styles/register.scss";
import FormGroup from "../components/FormGroup";
import { useAuth } from "../hook/useAuth";
import { getAuthErrorMessage } from "../utils/getAuthError";
import { AlertIcon } from "../../shared/components/Icons";

const Register = () => {
  const { user, loading, handleRegister } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    setError("");

    try {
      await handleRegister({ username, email, password });
    } catch (submitError) {
      setError(
        getAuthErrorMessage(
          submitError,
          "The room couldn’t create your account. Try another email or username.",
        ),
      );
    }
  };

  if (user) return <Navigate to="/" replace />;

  return (
    <main className="auth-page register-page">
      <section className="auth-card" aria-labelledby="register-title">
        <div className="auth-brand">
          <span className="auth-brand__ring" aria-hidden="true" />
          <span className="auth-brand__name">Moodify</span>
          <span className="auth-brand__tag">Listening room</span>
        </div>

        <div className="auth-heading">
          <p className="eyebrow">Create account</p>
          <h1 id="register-title">Make the room yours.</h1>
          <p>One account. A thousand moods to tune.</p>
        </div>

        {error && (
          <div className="auth-alert" role="alert">
            <AlertIcon />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} aria-busy={loading}>
          <FormGroup
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Pick a name for the room"
            autoComplete="username"
            disabled={loading}
          />
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
            placeholder="Create a password"
            autoComplete="new-password"
            disabled={loading}
          />

          <button type="submit" className="button auth-submit" disabled={loading}>
            {loading && <span className="auth-spinner" aria-hidden="true" />}
            {loading ? "Opening the room…" : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have a key? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
};

export default Register;
