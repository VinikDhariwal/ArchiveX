import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PasswordField from '../../components/auth/PasswordField.jsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { useLoginMutation } from '../../app/api.js';
import { selectIsAdmin, selectIsAuthenticated } from '../../features/auth/authSlice.js';
import { clientConfig } from '../../config/clientConfig.js';

export default function AdminLoginPage() {
  useDocumentTitle('Admin sign in');
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const [login, { isLoading, error }] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (isAuthenticated && isAdmin) {
    const next = location.state?.from || '/admin';
    return <Navigate to={next} replace />;
  }

  if (isAuthenticated && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      await login({ email, password, staffOnly: true }).unwrap();
      const next = location.state?.from || '/admin';
      navigate(next, { replace: true });
    } catch {
      /* shown below */
    }
  };

  const message = error?.data?.error?.message || (error ? 'Could not sign in.' : null);

  return (
    <main className="admin-login-page">
      <div className="admin-login-page__panel">
        <header className="page-head">
          <p className="meta">{clientConfig.appName}</p>
          <h1 className="display page-head__title">Admin sign in</h1>
          <p className="page-lede">
            Staff access only. Operator accounts are created from Admin → Users — there is no public
            staff registration.
          </p>
        </header>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            <span className="meta">Email</span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <PasswordField
            id="admin-login-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {message ? <p className="auth-form__error">{message}</p> : null}
          <div className="auth-form__actions">
            <button type="submit" className="btn auth-form__submit" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign in to admin'}
            </button>
          </div>
        </form>

        <p className="auth-page__switch">
          Looking for the archive? <Link to="/login">Collector sign in</Link>
        </p>
      </div>
    </main>
  );
}
