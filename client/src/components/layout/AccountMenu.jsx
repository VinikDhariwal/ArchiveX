import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  selectAuthUser,
  selectIsAdmin,
  selectIsAuthenticated,
} from '../../features/auth/authSlice.js';
import { useLogoutMutation } from '../../app/api.js';

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="9" r="3.25" />
      <path d="M5.5 19.5c1.6-3 4-4.5 6.5-4.5s4.9 1.5 6.5 4.5" />
    </svg>
  );
}

/** Guest: Log In button. Signed in: account icon with profile options. */
export default function AccountMenu() {
  const menuId = useId();
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const user = useSelector(selectAuthUser);
  const [open, setOpen] = useState(false);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!isAuthenticated) setOpen(false);
  }, [isAuthenticated]);

  async function handleSignOut() {
    setOpen(false);
    try {
      await logout().unwrap();
    } catch {
      /* credentials cleared in mutation finally */
    }
    navigate('/login', { replace: true });
  }

  function closeAndGo() {
    setOpen(false);
  }

  if (!isAuthenticated) {
    return (
      <Link className="btn header-login-btn" to="/login">
        Log in
      </Link>
    );
  }

  return (
    <div className={`account-menu ${open ? 'is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="icon-btn account-menu__trigger"
        aria-label={`Account menu for ${user?.name || 'collector'}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <ProfileIcon />
      </button>

      {open ? (
        <div className="account-menu__panel" id={menuId} role="menu" aria-label="Account">
          <div className="account-menu__identity">
            <p className="account-menu__name">{user?.name || 'Collector'}</p>
            <p className="account-menu__email">{user?.email}</p>
          </div>
          <Link className="account-menu__item" role="menuitem" to="/account" onClick={closeAndGo}>
            Profile
          </Link>
          <Link
            className="account-menu__item"
            role="menuitem"
            to="/account/settings"
            onClick={closeAndGo}
          >
            Settings
          </Link>
          <Link
            className="account-menu__item"
            role="menuitem"
            to="/contribute"
            onClick={closeAndGo}
          >
            Contribute
          </Link>
          <Link
            className="account-menu__item"
            role="menuitem"
            to="/account/submissions"
            onClick={closeAndGo}
          >
            My submissions
          </Link>
          {isAdmin ? (
            <Link className="account-menu__item" role="menuitem" to="/admin" onClick={closeAndGo}>
              Admin
            </Link>
          ) : null}
          <button
            type="button"
            className="account-menu__item"
            role="menuitem"
            disabled={isLoggingOut}
            onClick={handleSignOut}
          >
            {isLoggingOut ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
