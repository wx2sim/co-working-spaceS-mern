import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import ClientDashboard from './ClientDashboard';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useLanguage } from '../../context/LanguageContext';

export default function Dashboard() {
  const { t } = useLanguage();
  useDocumentTitle(`${t('dashboard_title')} | Co-Spaces`);
  const { currentUser } = useSelector((state) => state.user);

  if (!currentUser) return <Navigate to='/error/401' />;

  if (!currentUser.role) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin'></div>
          <p className='text-sm text-slate-500 font-medium'>{t('securing_session')}</p>
        </div>
      </div>
    );
  }

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
