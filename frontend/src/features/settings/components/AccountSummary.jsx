import { useState } from "react";
import { Link } from "react-router-dom";
import { DownloadIcon } from "../../shared/components/Icons";
import { getAuthErrorMessage } from "../../auth/utils/getAuthError";
import { exportAccountData } from "../services/settings.api";

const JOINED_FORMAT = new Intl.DateTimeFormat(undefined, {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const getExportError = async (error) => {
  const data = error?.response?.data;

  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      if (typeof parsed?.message === "string" && parsed.message.trim()) {
        return parsed.message;
      }
    } catch {
      // The download error was not the JSON envelope; use the fallback below.
    }
  }

  return getAuthErrorMessage(
    error,
    "The export could not be downloaded. Try again.",
  );
};

const AccountSummary = ({ summary, loading, error }) => {
  const [exportState, setExportState] = useState({ status: "idle", message: "" });

  const joinedAt = summary?.joinedAt ? new Date(summary.joinedAt) : null;
  const joinedIsValid =
    joinedAt instanceof Date && !Number.isNaN(joinedAt.getTime());
  const hasCount = Number.isFinite(summary?.moodEntryCount);
  const countLabel = hasCount
    ? summary.moodEntryCount.toLocaleString()
    : loading
      ? "Counting…"
      : "Unavailable";

  const handleExport = async () => {
    if (exportState.status === "loading") return;

    setExportState({ status: "loading", message: "" });

    try {
      const response = await exportAccountData();
      const blob = new Blob([response.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.download = `moodmusic-account-${stamp}.json`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      setExportState({ status: "success", message: "Download started." });
    } catch (exportError) {
      setExportState({
        status: "error",
        message: await getExportError(exportError),
      });
    }
  };

  const exporting = exportState.status === "loading";

  return (
    <section
      className="settings-card settings-summary"
      aria-labelledby="settings-summary-title"
      aria-busy={loading}
    >
      <header className="settings-card__head">
        <div>
          <p className="eyebrow">Account</p>
          <h2 id="settings-summary-title">Your listener card</h2>
        </div>
        <span className="settings-badge">Private</span>
      </header>

      {error && (
        <p className="settings-feedback is-error" role="alert">
          {error}
        </p>
      )}

      <dl className="settings-facts">
        <div className="settings-fact">
          <dt>Username</dt>
          <dd>{summary?.username || "Not set"}</dd>
        </div>
        <div className="settings-fact">
          <dt>Email</dt>
          <dd className="settings-fact__email">{summary?.email || "Not set"}</dd>
        </div>
        <div className="settings-fact">
          <dt>Joined</dt>
          <dd>
            {joinedIsValid ? (
              <time dateTime={joinedAt.toISOString()}>
                {JOINED_FORMAT.format(joinedAt)}
              </time>
            ) : (
              "Not recorded"
            )}
          </dd>
        </div>
        <div className="settings-fact">
          <dt>Mood entries</dt>
          <dd>{countLabel}</dd>
        </div>
      </dl>

      <div className="settings-summary__foot">
        <button
          type="button"
          className="button button--ghost settings-export"
          onClick={handleExport}
          disabled={exporting}
          aria-busy={exporting}
        >
          {exporting ? (
            <span className="settings-spinner" aria-hidden="true" />
          ) : (
            <DownloadIcon />
          )}
          <span>{exporting ? "Preparing export…" : "Export my data"}</span>
        </button>

        <nav className="settings-policies" aria-label="Privacy and terms">
          <Link to="/privacy">Privacy policy</Link>
          <span className="settings-policies__dot" aria-hidden="true">
            ·
          </span>
          <Link to="/terms">Terms of use</Link>
        </nav>
      </div>

      <p className="settings-summary__note">
        The export includes your account details and every mood entry in your
        journal. It never includes your password.
      </p>

      {exportState.status !== "idle" && (
        <p
          className={`settings-feedback is-${exportState.status}`}
          role={exportState.status === "error" ? "alert" : "status"}
        >
          {exportState.message}
        </p>
      )}
    </section>
  );
};

export default AccountSummary;
