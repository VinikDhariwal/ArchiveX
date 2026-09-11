import { useState } from 'react';

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A10.5 10.5 0 0112 5c5 0 9.3 3.1 11 7.5a11.7 11.7 0 01-4.1 5.1M6.1 6.1A11.7 11.7 0 001 12.5C2.7 16.9 7 20 12 20c1.5 0 2.9-.3 4.2-.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M1 12.5C2.7 8.1 7 5 12 5s9.3 3.1 11 7.5C21.3 16.9 17 20 12 20S2.7 16.9 1 12.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12.5" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/** Password input with show/hide toggle. */
export default function PasswordField({
  label = 'Password',
  value,
  onChange,
  autoComplete = 'current-password',
  required = true,
  minLength = 8,
  id,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label htmlFor={id}>
      <span className="meta">{label}</span>
      <span className="auth-form__password">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          className="auth-form__toggle"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
          onClick={() => setShowPassword((open) => !open)}
        >
          <EyeIcon open={showPassword} />
        </button>
      </span>
    </label>
  );
}
