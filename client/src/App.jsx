import { useSelector } from 'react-redux';
import AppRoutes from './routes/AppRoutes.jsx';
import { selectAccessToken } from './features/auth/authSlice.js';
import { useGetMeQuery } from './app/api.js';
import './styles/global.css';
import './styles/archive.css';

function AuthBootstrap({ children }) {
  const token = useSelector(selectAccessToken);
  useGetMeQuery(undefined, { skip: !token });
  return children;
}

export default function App() {
  return (
    <AuthBootstrap>
      <AppRoutes />
    </AuthBootstrap>
  );
}
