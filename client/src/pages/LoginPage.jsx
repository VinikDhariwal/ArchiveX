import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import PasswordField from '../components/auth/PasswordField.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useLoginMutation } from '../app/api.js';

export default function LoginPage() {
  useDocumentTitle('Log in');
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading, error }] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const gateNotice = location.state?.notice || null;

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

  const message = error?.data?.error?.message || (error ? 'Could not log in.' : null);

  return (
    <main className="auth-page auth-page--wide">
      <div className="auth-page__stage">
        <aside className="auth-page__intro">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Log in' }]} />
          <p className="meta">Collector access</p>
          <h1 className="display auth-page__title">Log in</h1>
          <p className="auth-page__lede">
            Return to your favorites, collections, and the plates you marked for study.
          </p>
          <ul className="auth-page__points">
            <li>Your desk stays private to your account</li>
            <li>Staff use a separate admin entrance</li>
            <li>New here? Create an account in a minute</li>
          </ul>
        </aside>

        <div className="auth-page__panel">
          {gateNotice ? (
            <p className="auth-page__notice" role="status">
              {gateNotice}
            </p>
          ) : null}

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
            <PasswordField
              id="login-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {message ? <p className="auth-form__error">{message}</p> : null}
            <div className="auth-form__actions">
              <button type="submit" className="btn auth-form__submit" disabled={isLoading}>
                {isLoading ? 'Logging in…' : 'Log in'}
              </button>
            </div>
          </form>

          <p className="auth-page__switch">
            New here? <Link to="/register">Create new account</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
