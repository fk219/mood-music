import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoomHeader from "../../shared/components/RoomHeader";
import SiteFooter from "../../shared/components/SiteFooter";
import AccountSummary from "../components/AccountSummary";
import ChangePasswordForm from "../components/ChangePasswordForm";
import DangerZone from "../components/DangerZone";
import { useAuth } from "../../auth/hook/useAuth";
import { getMe } from "../../auth/services/auth.api";
import { getAuthErrorMessage } from "../../auth/utils/getAuthError";
import "../styles/settings.scss";

const Settings = () => {
  const { user, clearSession } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(user);
  const [summaryState, setSummaryState] = useState({
    loading: true,
    error: "",
  });
  const [redirectNotice, setRedirectNotice] = useState("");

  useEffect(() => {
    let active = true;

    const loadSummary = async () => {
      try {
        const response = await getMe();
        if (!active) return;

        setSummary(response?.user || null);
        setSummaryState({ loading: false, error: "" });
      } catch (error) {
        if (!active) return;

        if (error?.response?.status === 401) {
          navigate("/login", {
            replace: true,
            state: { notice: "Your session ended. Sign in again." },
          });
          clearSession();
          return;
        }

        setSummaryState({
          loading: false,
          error: getAuthErrorMessage(
            error,
            "Your account details could not be refreshed. Showing the last known details.",
          ),
        });
      }
    };

    loadSummary();

    return () => {
      active = false;
    };
  }, [navigate, clearSession]);

  useEffect(() => {
    if (!redirectNotice) return undefined;

    const timer = window.setTimeout(() => {
      navigate("/login", { replace: true, state: { notice: redirectNotice } });
      clearSession();
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [redirectNotice, navigate, clearSession]);

  const account = summary || user;
  const isDemo = account?.email?.toLowerCase() === "demo@moodmusic.local";
  const redirecting = Boolean(redirectNotice);

  return (
    <div className="settings-page">
      <RoomHeader active="settings" />

      <main className="settings-shell">
        <header className="settings-hero">
          <p className="eyebrow">Account settings</p>
          <h1>Keep your room in tune.</h1>
          <p>
            Review the details tied to your listening room, take a copy of your
            journal, or close the account when you are done.
          </p>
        </header>

        <div className="settings-grid">
          <AccountSummary
            summary={account}
            loading={summaryState.loading}
            error={summaryState.error}
          />
          <ChangePasswordForm
            onPasswordChanged={setRedirectNotice}
            disabled={redirecting}
            isDemo={isDemo}
          />
        </div>

        <DangerZone
          onAccountDeleted={setRedirectNotice}
          disabled={redirecting}
          isDemo={isDemo}
        />
      </main>

      <SiteFooter />
    </div>
  );
};

export default Settings;
