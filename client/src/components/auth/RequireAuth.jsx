import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAccessToken, selectAuthUser, selectIsAdmin } from '../../features/auth/authSlice.js';
import { useGetMeQuery } from '../../app/api.js';
import LoadingState from '../feedback/LoadingState.jsx';

export function RequireAuth({ children, loginPath = '/login' }) {
  const token = useSelector(selectAccessToken);
  const user = useSelector(selectAuthUser);
  const location = useLocation();
  const { isLoading, isFetching, isError } = useGetMeQuery(undefined, {
    skip: !token,
  });

  if (!token) {
    return <Navigate to={loginPath} replace state={{ from: location.pathname + location.search }} />;
  }

  if (!user && (isLoading || isFetching)) {
    return (
      <div className="route-shell">
        <div className="route-shell__inner">
          <LoadingState />
        </div>
      </div>
    );
  }

  if (isError && !user) {
    return <Navigate to={loginPath} replace state={{ from: location.pathname + location.search }} />;
  }

  return children;
}

export function RequireAdmin({ children }) {
  const isAdmin = useSelector(selectIsAdmin);
  const user = useSelector(selectAuthUser);

  return (
    <RequireAuth loginPath="/admin/login">
      {user && !isAdmin ? <Navigate to="/unauthorized" replace /> : children}
    </RequireAuth>
  );
}
