const FormGroup = ({
  label,
  placeholder,
  type = "text",
  value = "",
  onChange,
  autoComplete,
  disabled = false,
}) => {
  const id = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        value={value}
        onChange={onChange}
        type={type}
        id={id}
        name={id}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        required
      />
    </div>
  );
};

export default FormGroup;
