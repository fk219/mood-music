import { useState } from "react";
import SettingsField from "./SettingsField";
import { changePassword } from "../services/settings.api";
import { getAuthErrorMessage } from "../../auth/utils/getAuthError";
import { LockIcon } from "../../shared/components/Icons";

const FIELD_IDS = {
  currentPassword: "settings-current-password",
  newPassword: "settings-new-password",
  confirmPassword: "settings-confirm-password",
};

const EMPTY_VALUES = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const validate = (values) => {
  const errors = {};

  if (!values.currentPassword) {
    errors.currentPassword = "Enter your current password.";
  }

  if (!values.newPassword) {
    errors.newPassword = "Choose a new password.";
  } else if (values.newPassword.length < 8 || values.newPassword.length > 72) {
    errors.newPassword = "Use 8 to 72 characters.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Repeat the new password.";
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = "The passwords do not match.";
  }

  return errors;
};

const ChangePasswordForm = ({ onPasswordChanged, disabled = false, isDemo = false }) => {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const busy = saving || disabled;

  const updateField = (field) => (event) => {
    const value = event.target.value;

    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });

    if (status?.type === "error") setStatus(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setStatus(null);

    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      document.getElementById(FIELD_IDS[firstInvalid])?.focus();
      return;
    }

    setSaving(true);

    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      setValues(EMPTY_VALUES);
      setStatus({
        type: "success",
        message: "Password updated. All sessions were signed out.",
      });
      onPasswordChanged?.(
        "Password updated. All sessions were signed out. Sign in again with your new password.",
      );
    } catch (error) {
      setStatus({
        type: "error",
        message: getAuthErrorMessage(
          error,
          "The password could not be changed. Check your current password and try again.",
        ),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      className="settings-card settings-password"
      aria-labelledby="settings-password-title"
      aria-busy={busy}
    >
      <header className="settings-card__head">
        <div>
          <p className="eyebrow">Security</p>
          <h2 id="settings-password-title">Change password</h2>
        </div>
        <span className="settings-card__icon" aria-hidden="true">
          <LockIcon />
        </span>
      </header>

      <p className="settings-card__sub">
        Changing your password signs out every device, including this one. Sign
        back in with the new password afterward.
      </p>

      {isDemo ? (
        <p className="settings-card__sub">
          This is the shared demo account, so it uses a generated password and
          cannot be changed here. Create a personal account to manage your own
          credentials.
        </p>
      ) : (
      <form className="settings-form" onSubmit={handleSubmit} noValidate>
        <SettingsField
          id={FIELD_IDS.currentPassword}
          label="Current password"
          type="password"
          value={values.currentPassword}
          onChange={updateField("currentPassword")}
          autoComplete="current-password"
          placeholder="Your current password"
          error={errors.currentPassword}
          disabled={busy}
          maxLength={72}
          required
        />

        <SettingsField
          id={FIELD_IDS.newPassword}
          label="New password"
          type="password"
          value={values.newPassword}
          onChange={updateField("newPassword")}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          hint="8 to 72 characters."
          error={errors.newPassword}
          disabled={busy}
          minLength={8}
          maxLength={72}
          required
        />

        <SettingsField
          id={FIELD_IDS.confirmPassword}
          label="Confirm new password"
          type="password"
          value={values.confirmPassword}
          onChange={updateField("confirmPassword")}
          autoComplete="new-password"
          placeholder="Repeat the new password"
          error={errors.confirmPassword}
          disabled={busy}
          minLength={8}
          maxLength={72}
          required
        />

        <button
          type="submit"
          className="button settings-submit"
          disabled={busy}
        >
          {saving && <span className="settings-spinner is-dark" aria-hidden="true" />}
          {saving ? "Updating…" : "Update password"}
        </button>

        {status && (
          <p
            className={`settings-feedback is-${status.type}`}
            role={status.type === "error" ? "alert" : "status"}
          >
            {status.message}
          </p>
        )}
      </form>
      )}
    </section>
  );
};

export default ChangePasswordForm;
