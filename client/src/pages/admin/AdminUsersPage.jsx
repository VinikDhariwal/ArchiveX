import { useState } from 'react';
import {
  useCreateAdminUserMutation,
  useGetAdminUsersQuery,
  useUpdateAdminUserMutation,
} from '../../app/api.js';
import MuseumSelect from '../../components/ui/MuseumSelect.jsx';
import AdminPageShell from './AdminPageShell.jsx';

const ROLES = ['user', 'editor', 'moderator', 'admin', 'superadmin'];
const STATUSES = ['active', 'disabled', 'pending'];

const empty = {
  name: '',
  username: '',
  email: '',
  password: '',
  role: 'user',
  status: 'active',
};

export default function AdminUsersPage() {
  const { data: users = [], isLoading, isError, error } = useGetAdminUsersQuery();
  const [createUser, createState] = useCreateAdminUserMutation();
  const [updateUser] = useUpdateAdminUserMutation();
  const [form, setForm] = useState(empty);
  const [formError, setFormError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const forbidden = error?.status === 403;

  const onUpdateUser = async (user, patch) => {
    setUpdateError(null);
    try {
      await updateUser({ id: user.id, ...patch }).unwrap();
    } catch (err) {
      setUpdateError(err?.data?.error?.message || `Could not update ${user.name}.`);
    }
  };

  const onCreate = async (event) => {
    event.preventDefault();
    setFormError(null);
    try {
      await createUser(form).unwrap();
      setForm(empty);
    } catch (err) {
      setFormError(err?.data?.error?.message || 'Could not create account.');
    }
  };

  return (
    <AdminPageShell
      eyebrow="Admin · Users"
      title="User management"
      lede="Create collector and staff accounts. Collectors can also self-register; staff roles stay operator-only."
    >
      {!forbidden ? (
        <form className="admin-form admin-form--compact" onSubmit={onCreate}>
          <div className="admin-form__grid">
            <label>
              <span className="meta">Name</span>
              <input
                required
                minLength={2}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              <span className="meta">Username (optional)</span>
              <input
                minLength={3}
                maxLength={30}
                pattern="[A-Za-z0-9._\-!@#$]{3,30}"
                value={form.username || ''}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Optional · letters / . _ - ! @ # $"
              />
            </label>
            <label>
              <span className="meta">Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label>
              <span className="meta">Password</span>
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            <label>
              <span className="meta">Role</span>
              <MuseumSelect
                ariaLabel="Role"
                value={form.role}
                options={ROLES}
                onChange={(role) => setForm({ ...form, role })}
              />
            </label>
            <label>
              <span className="meta">Status</span>
              <MuseumSelect
                ariaLabel="Status"
                value={form.status}
                options={STATUSES}
                onChange={(status) => setForm({ ...form, status })}
              />
            </label>
          </div>
          {formError ? <p className="auth-form__error">{formError}</p> : null}
          <button type="submit" className="btn" disabled={createState.isLoading}>
            {createState.isLoading ? 'Creating…' : 'Create account'}
          </button>
        </form>
      ) : null}

      {isLoading ? <p className="admin-muted">Loading users…</p> : null}
      {forbidden ? (
        <p className="auth-form__error">Your role cannot manage users.</p>
      ) : null}
      {isError && !forbidden ? <p className="auth-form__error">Could not load users.</p> : null}
      {updateError ? <p className="auth-form__error" role="alert">{updateError}</p> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.username ? `@${user.username}` : '—'}</td>
                <td>{user.email}</td>
                <td>
                  <MuseumSelect
                    ariaLabel={`Role for ${user.name}`}
                    value={user.role}
                    options={ROLES}
                    onChange={(role) => onUpdateUser(user, { role })}
                  />
                </td>
                <td>
                  <MuseumSelect
                    ariaLabel={`Status for ${user.name}`}
                    value={user.status}
                    options={STATUSES}
                    onChange={(status) => onUpdateUser(user, { status })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPageShell>
  );
}
