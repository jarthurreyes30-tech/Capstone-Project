import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // If the user is not logged in, redirect them to the login page.
    // We also pass the original page they were trying to access in a `return_to` query parameter.
    return <Navigate to={`/auth/login?return_to=${location.pathname}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
