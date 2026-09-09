import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useRegisterMutation } from '../app/api.js';

export default function RegisterPage() {
  useDocumentTitle('Create account');
  const navigate = useNavigate();
  const [register, { isLoading, error }] = useRegisterMutation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      await register({ name, email, password }).unwrap();
      navigate('/account', { replace: true });
    } catch {
      /* shown below */
    }
  };

  const message = error?.data?.error?.message || (error ? 'Could not create account.' : null);

  return (
    <main className="auth-page">
      <div className="section-inner auth-page__inner">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Register' }]} />
        <header className="page-head">
          <p className="meta">Join the archive</p>
          <h1 className="display page-head__title">Create account</h1>
          <p className="page-lede">
            Contributors can propose objects and images under brands. Public display still requires admin
            approval.
          </p>
        </header>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            <span className="meta">Name</span>
            <input
              type="text"
              autoComplete="name"
              required
              minLength={2}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
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
          <label>
            <span className="meta">Password</span>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {message ? <p className="auth-form__error">{message}</p> : null}
          <button type="submit" className="link-cta" disabled={isLoading}>
            {isLoading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="auth-page__switch">
          Already collecting? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
