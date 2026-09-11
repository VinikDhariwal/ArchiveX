import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Breadcrumbs from '../components/layout/Breadcrumbs.jsx';
import PasswordField from '../components/auth/PasswordField.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { selectAuthUser, selectIsAdmin } from '../features/auth/authSlice.js';
import {
  useChangeEmailMutation,
  useChangePasswordMutation,
  useDeleteMeMutation,
  useUpdateMeMutation,
} from '../app/api.js';

export default function AccountSettingsPage() {
  useDocumentTitle('Settings');
  const navigate = useNavigate();
  const user = useSelector(selectAuthUser);
  const isAdmin = useSelector(selectIsAdmin);

  const [updateMe, updateState] = useUpdateMeMutation();
  const [changeEmail, emailState] = useChangeEmailMutation();
  const [changePassword, passwordState] = useChangePasswordMutation();
  const [deleteMe, deleteState] = useDeleteMeMutation();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [profileMessage, setProfileMessage] = useState(null);
  const [profileError, setProfileError] = useState(null);

  const [email, setEmail] = useState(user?.email || '');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailMessage, setEmailMessage] = useState(null);
  const [emailError, setEmailError] = useState(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const [deleteStep, setDeleteStep] = useState(0);
  const [confirmUsername, setConfirmUsername] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState(null);

  if (!user) return null;

  async function onSaveProfile(event) {
    event.preventDefault();
    setProfileError(null);
    setProfileMessage(null);
    try {
      await updateMe({ firstName, lastName, username }).unwrap();
      setProfileMessage('Profile updated.');
    } catch (err) {
      const code = err?.data?.error?.code;
      if (code === 'USERNAME_IN_USE') {
        setProfileError('That username is already taken. Choose another.');
      } else {
        setProfileError(err?.data?.error?.message || 'Could not save profile.');
      }
    }
  }

  async function onChangeEmail(event) {
    event.preventDefault();
    setEmailError(null);
    setEmailMessage(null);
    try {
      await changeEmail({ email, password: emailPassword }).unwrap();
      setEmailPassword('');
      setEmailMessage('Email updated.');
    } catch (err) {
      setEmailError(err?.data?.error?.message || 'Could not update email.');
    }
  }

  async function onChangePassword(event) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Password updated.');
    } catch (err) {
      setPasswordError(err?.data?.error?.message || 'Could not update password.');
    }
  }

  async function onDelete(event) {
    event.preventDefault();
    setDeleteError(null);
    try {
      await deleteMe({ confirmUsername, password: deletePassword }).unwrap();
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError(err?.data?.error?.message || 'Could not delete account.');
    }
  }

  return (
    <main className="account-page account-page--desk">
      <div className="section-inner account-page__desk account-settings">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Profile', to: '/account' },
            { label: 'Settings' },
          ]}
        />

        <header className="page-head">
          <p className="meta">Account settings</p>
          <h1 className="display page-head__title">Settings</h1>
          <p className="page-lede">
            Edit your profile, email, password, and account access from one place.
          </p>
        </header>

        <div className="account-settings__grid">
          <section className="account-settings__card">
            <h2 className="account-settings__title">Edit profile</h2>
            <form className="account-settings__form" onSubmit={onSaveProfile}>
              <label>
                <span className="meta">First name</span>
                <input
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </label>
              <label>
                <span className="meta">Last name</span>
                <input
                  required
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </label>
              <label>
                <span className="meta">Username</span>
                <input
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="[A-Za-z0-9._\-!@#$]{3,30}"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
                <span className="auth-form__hint">
                  3–30 characters · letters, numbers, and . _ - ! @ # $
                </span>
              </label>
              {profileError ? <p className="auth-form__error">{profileError}</p> : null}
              {profileMessage ? <p className="account-settings__ok">{profileMessage}</p> : null}
              <button type="submit" className="btn btn--soft" disabled={updateState.isLoading}>
                {updateState.isLoading ? 'Saving…' : 'Save profile'}
              </button>
            </form>
          </section>

          <section className="account-settings__card">
            <h2 className="account-settings__title">Change email</h2>
            <form className="account-settings__form" onSubmit={onChangeEmail}>
              <label>
                <span className="meta">New email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <PasswordField
                id="settings-email-password"
                label="Current password"
                value={emailPassword}
                onChange={(event) => setEmailPassword(event.target.value)}
              />
              {emailError ? <p className="auth-form__error">{emailError}</p> : null}
              {emailMessage ? <p className="account-settings__ok">{emailMessage}</p> : null}
              <button type="submit" className="btn btn--soft" disabled={emailState.isLoading}>
                {emailState.isLoading ? 'Saving…' : 'Update email'}
              </button>
            </form>
          </section>

          <section className="account-settings__card">
            <h2 className="account-settings__title">Change password</h2>
            <form className="account-settings__form" onSubmit={onChangePassword}>
              <PasswordField
                id="settings-current-password"
                label="Current password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
              <PasswordField
                id="settings-new-password"
                label="New password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              <PasswordField
                id="settings-confirm-password"
                label="Confirm new password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              {passwordError ? <p className="auth-form__error">{passwordError}</p> : null}
              {passwordMessage ? <p className="account-settings__ok">{passwordMessage}</p> : null}
              <button type="submit" className="btn btn--soft" disabled={passwordState.isLoading}>
                {passwordState.isLoading ? 'Saving…' : 'Update password'}
              </button>
            </form>
          </section>

          {!isAdmin ? (
            <section className="account-settings__card account-settings__card--danger">
              <h2 className="account-settings__title">Delete account</h2>
              <p className="account-settings__note">
                This disables your collector account and signs you out. Staff accounts are managed
                in Admin.
              </p>

              {deleteStep === 0 ? (
                <button
                  type="button"
                  className="btn btn--soft"
                  onClick={() => {
                    setDeleteStep(1);
                    setDeleteError(null);
                  }}
                >
                  Delete account
                </button>
              ) : null}

              {deleteStep === 1 ? (
                <div className="account-settings__form">
                  <p className="account-settings__note">
                    Step 1 of 2 — confirm you want to permanently disable this account.
                  </p>
                  <div className="account-profile__edit-actions">
                    <button type="button" className="btn btn--soft" onClick={() => setDeleteStep(2)}>
                      Continue
                    </button>
                    <button type="button" className="btn btn--soft" onClick={() => setDeleteStep(0)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}

              {deleteStep === 2 ? (
                <form className="account-settings__form" onSubmit={onDelete}>
                  <p className="account-settings__note">
                    Step 2 of 2 — type <strong>@{user.username}</strong> and your password.
                  </p>
                  <label>
                    <span className="meta">Username</span>
                    <input
                      required
                      value={confirmUsername}
                      onChange={(event) => setConfirmUsername(event.target.value)}
                      autoComplete="off"
                    />
                  </label>
                  <PasswordField
                    id="settings-delete-password"
                    value={deletePassword}
                    onChange={(event) => setDeletePassword(event.target.value)}
                  />
                  {deleteError ? <p className="auth-form__error">{deleteError}</p> : null}
                  <div className="account-profile__edit-actions">
                    <button type="submit" className="btn btn--soft" disabled={deleteState.isLoading}>
                      {deleteState.isLoading ? 'Deleting…' : 'Delete forever'}
                    </button>
                    <button type="button" className="btn btn--soft" onClick={() => setDeleteStep(0)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}
            </section>
          ) : (
            <section className="account-settings__card">
              <h2 className="account-settings__title">Staff account</h2>
              <p className="account-settings__note">
                Staff deletion is handled in Admin → Users. You can still edit profile, email, and
                password here.
              </p>
              <Link className="btn btn--soft" to="/admin/users">
                Open admin users
              </Link>
            </section>
          )}
        </div>

        <p className="auth-page__switch">
          <Link to="/account">Back to profile</Link>
        </p>
      </div>
    </main>
  );
}
