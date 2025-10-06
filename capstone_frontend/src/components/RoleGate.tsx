import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/services/auth';

interface RoleGateProps {
  children: JSX.Element;
  allow: User['role'][];
}

const RoleGate = ({ children, allow }: RoleGateProps) => {
  const { user } = useAuth();

  // If the user's role is not in the "allow" list, redirect them.
  if (!user || !allow.includes(user.role)) {
    // For now, we'll just send them to the home page if they don't have access.
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleGate;
