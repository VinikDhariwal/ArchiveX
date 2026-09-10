import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useLoginMutation } from '../app/api.js';

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

export default function LoginPage() {
  useDocumentTitle('Sign in');
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading, error }] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      await login({ email, password }).unwrap();
      const next = location.state?.from || '/account';
      navigate(next, { replace: true });
    } catch {
      /* shown below */
    }
  };

  const message = error?.data?.error?.message || (error ? 'Could not sign in.' : null);

  return (
    <main className="auth-page">
      <div className="section-inner auth-page__inner">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Sign in' }]} />
        <header className="page-head">
          <p className="meta">Collector access</p>
          <h1 className="display page-head__title">Sign in</h1>
          <p className="page-lede">Accounts are created by archive operators. Sign in with credentials issued from Admin.</p>
        </header>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            <span className="meta">Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            <span className="meta">Password</span>
            <span className="auth-form__password">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                className="auth-form__toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((value) => !value)}
              >
                <EyeIcon open={showPassword} />
              </button>
            </span>
          </label>
          {message ? <p className="auth-form__error">{message}</p> : null}
          <div className="auth-form__actions">
            <button type="submit" className="btn auth-form__submit" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
