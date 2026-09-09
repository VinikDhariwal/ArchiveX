import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useLoginMutation } from '../app/api.js';

export default function LoginPage() {
  useDocumentTitle('Sign in');
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading, error }] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
          <p className="page-lede">Enter the archive to save, collect, and contribute under brands.</p>
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
            <input
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {message ? <p className="auth-form__error">{message}</p> : null}
          <button type="submit" className="link-cta" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-page__switch">
          New to ArchiveX? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
