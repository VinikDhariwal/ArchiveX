import { Outlet } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';

/**
 * Public website layout — reuses AppShell (header + footer).
 * Keeps the wide Ivory Museum composition for all public routes.
 */
export default function PublicLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
