import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import PasswordField from '../components/auth/PasswordField.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useRegisterMutation } from '../app/api.js';

export default function RegisterPage() {
  useDocumentTitle('Create new account');
  const navigate = useNavigate();
  const location = useLocation();
  const [register, { isLoading, error }] = useRegisterMutation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(() => location.state?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState(null);
  const notice = location.state?.notice || null;

  const onSubmit = async (event) => {
    event.preventDefault();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    try {
      await register({
        firstName,
        lastName,
        username: username.trim(),
        email,
        password,
      }).unwrap();
      navigate('/account', { replace: true });
    } catch {
      /* shown below */
    }
  };

  const apiCode = error?.data?.error?.code;
  const message =
    localError ||
    (apiCode === 'USERNAME_IN_USE'
      ? 'That username is already taken. Choose another.'
      : null) ||
    (apiCode === 'STAFF_EMAIL_IN_USE'
      ? 'That email belongs to the staff/admin account. Collector accounts need a different email — then use Log in for this desk, or Admin sign in for staff.'
      : null) ||
    (apiCode === 'EMAIL_IN_USE'
      ? 'That email already has a collector account. Log in instead, or use a different email.'
      : null) ||
    error?.data?.error?.message ||
    (error ? 'Could not create account.' : null);

  return (
    <main className="auth-page auth-page--wide">
      <div className="auth-page__stage">
        <aside className="auth-page__intro">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Log in', to: '/login' },
              { label: 'Create new account' },
            ]}
          />
          <p className="meta">Collector access</p>
          <h1 className="display auth-page__title">Create new account</h1>
          <p className="auth-page__lede">
            Open a collector desk for favorites, collections, and plates you want to keep close.
            Staff/admin use a separate email and sign in at Admin — not this form.
          </p>
          <ul className="auth-page__points">
            <li>Save plates across cars, motorcycles, and watches</li>
            <li>Build private collections for study</li>
            <li>Use your own email — not the operator admin address</li>
          </ul>
        </aside>

        <div className="auth-page__panel">
          {notice ? (
            <p className="auth-page__notice" role="status">
              {notice}
            </p>
          ) : null}

          <form className="auth-form auth-form--signup" onSubmit={onSubmit}>
            <div className="auth-form__row">
              <label>
                <span className="meta">First name</span>
                <input
                  type="text"
                  autoComplete="given-name"
                  required
                  minLength={1}
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </label>
              <label>
                <span className="meta">Last name</span>
                <input
                  type="text"
                  autoComplete="family-name"
                  required
                  minLength={1}
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </label>
            </div>
            <label>
              <span className="meta">Username</span>
              <input
                type="text"
                autoComplete="username"
                required
                minLength={3}
                maxLength={30}
                pattern="[A-Za-z0-9._\-!@#$]{3,30}"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
              <span className="auth-form__hint">
                Unique handle · 3–30 characters · letters, numbers, and . _ - ! @ # $
              </span>
            </label>
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
              id="register-password"
              label="Password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <PasswordField
              id="register-confirm"
              label="Confirm password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            {message ? <p className="auth-form__error">{message}</p> : null}
            <div className="auth-form__actions">
              <button type="submit" className="btn auth-form__submit" disabled={isLoading}>
                {isLoading ? 'Creating…' : 'Create new account'}
              </button>
            </div>
          </form>

          <p className="auth-page__switch">
            Already collecting? <Link to="/login">Log in</Link>
            {' · '}
            Staff? <Link to="/admin/login">Admin sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
