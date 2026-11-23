import { useState } from "react";
import SettingsField from "./SettingsField";
import { deleteAccount } from "../services/settings.api";
import { getAuthErrorMessage } from "../../auth/utils/getAuthError";
import { AlertIcon, TrashIcon } from "../../shared/components/Icons";

const PASSWORD_ID = "settings-delete-password";
const CONFIRM_ID = "settings-delete-confirm";

const DangerZone = ({
  onAccountDeleted,
  disabled = false,
  isDemo = false,
}) => {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const busy = deleting || disabled;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;

    const nextErrors = {};

    if (!password) {
      nextErrors.password = "Enter your password.";
    }

    if (confirmation !== "DELETE") {
      nextErrors.confirmation = "Type DELETE exactly to confirm.";
    }

    setErrors(nextErrors);
    setStatus(null);

    if (Object.keys(nextErrors).length > 0) {
      document
        .getElementById(nextErrors.password ? PASSWORD_ID : CONFIRM_ID)
        ?.focus();
      return;
    }

    setDeleting(true);

    try {
      await deleteAccount({ password });
      setPassword("");
      setConfirmation("");
      setStatus({
        type: "success",
        message: "Account deleted. Redirecting to sign in.",
      });
      onAccountDeleted?.(
        "Your account and mood journal were deleted. The shared track catalog stays. You can create a new account any time.",
      );
    } catch (error) {
      setStatus({
        type: "error",
        message: getAuthErrorMessage(
          error,
          "The account could not be deleted. Check your password and try again.",
        ),
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section
      className="settings-danger"
      aria-labelledby="settings-danger-title"
      aria-busy={busy}
    >
      <div className="settings-danger__copy">
        <p className="eyebrow">Danger zone</p>
        <h2 id="settings-danger-title">Delete account</h2>
        <p>
          Deleting your account removes your sign-in details and every mood
          entry in your journal. The shared track catalog stays for everyone
          else. This cannot be undone.
        </p>
        {isDemo && (
          <p className="settings-danger__demo">
            This is the shared demo account, so it cannot be deleted. Create a
            personal account to keep a private journal.
          </p>
        )}
      </div>

      <form className="settings-danger__form" onSubmit={handleSubmit} noValidate>
        <SettingsField
          id={PASSWORD_ID}
          label="Password"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (errors.password) {
              setErrors((previous) => ({ ...previous, password: undefined }));
            }
            if (status?.type === "error") setStatus(null);
          }}
          autoComplete="current-password"
          placeholder="Confirm with your password"
          error={errors.password}
          disabled={busy}
          maxLength={72}
          required
        />

        <SettingsField
          id={CONFIRM_ID}
          label="Type DELETE to confirm"
          value={confirmation}
          onChange={(event) => {
            setConfirmation(event.target.value);
            if (errors.confirmation) {
              setErrors((previous) => ({
                ...previous,
                confirmation: undefined,
              }));
            }
            if (status?.type === "error") setStatus(null);
          }}
          autoComplete="off"
          spellCheck={false}
          placeholder="DELETE"
          hint="Use capital letters."
          error={errors.confirmation}
          disabled={busy}
          required
        />

        <button
          type="submit"
          className="button settings-danger__button"
          disabled={busy}
        >
          {deleting ? (
            <span className="settings-spinner is-dark" aria-hidden="true" />
          ) : (
            <TrashIcon />
          )}
          <span>{deleting ? "Deleting account…" : "Delete my account"}</span>
        </button>

        {status && (
          <p
            className={`settings-feedback is-${status.type}`}
            role={status.type === "error" ? "alert" : "status"}
          >
            {status.type === "error" && <AlertIcon />}
            <span>{status.message}</span>
          </p>
        )}
      </form>
    </section>
  );
};

export default DangerZone;
