import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import PageSkeleton from '../components/feedback/PageSkeleton.jsx';
import { RequireAuth } from '../components/auth/RequireAuth.jsx';

/** Authenticated collector layout — requires a valid session. */
export default function AuthenticatedLayout() {
  return (
    <RequireAuth>
      <AppShell>
        <Suspense fallback={<PageSkeleton variant="shell" />}>
          <Outlet />
        </Suspense>
      </AppShell>
    </RequireAuth>
  );
}
