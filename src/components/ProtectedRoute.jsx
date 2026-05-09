import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth';
import toast from 'react-hot-toast';

export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    toast.error('Sesión expirada. Inicia sesión nuevamente.');
    return <Navigate to="/login" replace />;
  }

  return children;
}
