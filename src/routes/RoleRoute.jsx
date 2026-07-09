import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();

  if (!allowedRoles.includes(user?.role)) {
    toast.error('You do not have access to this page');
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;