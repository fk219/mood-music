const SettingsField = ({
  id,
  label,
  hint,
  error,
  disabled = false,
  ...inputProps
}) => {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`settings-field${error ? " is-invalid" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        disabled={disabled}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {hint && !error && (
        <p className="settings-field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="settings-field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default SettingsField;
