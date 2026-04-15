import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import ClientDashboard from './ClientDashboard';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';

export default function Dashboard() {
  const { currentUser } = useSelector((state) => state.user);

  if (!currentUser) return <Navigate to='/error/401' />;

  switch (currentUser.role) {
    case 'superadmin':
      return <SuperAdminDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'user':
      return <UserDashboard />;
    case 'client':
    default:
      return <ClientDashboard />;
  }
}
