import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AnimatedPage from '../../components/AnimatedPage';
import {
  FaUsers, FaArrowUp, FaCheck, FaTimes, FaUserShield,
  FaClipboardList, FaChevronRight, FaEnvelope, FaClock, FaStar, FaEdit, FaTrash
} from 'react-icons/fa';
import TaskModal from '../../components/TaskModal';
import AddReviewModal from '../../components/AddReviewModal';
import StatCard from '../../components/StatCard';
import AnalyticsChart from '../../components/AnalyticsChart';
import { FaWallet, FaChartLine, FaClipboardCheck, FaBuilding } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [upgradeRequests, setUpgradeRequests] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [teamTab, setTeamTab] = useState('user');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewToEdit, setReviewToEdit] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(true);
  
  // Analytics State
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [range, setRange] = useState('month');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${currentUser._id}`, {
          params: { limit: 5, sort: 'activityScore', order: 'desc', roleFilter: teamTab }
        });
        setUsers(data.users || []);
        // Only set totalUsers if we don't have it, or fetch it separately so it reflects total.
        // But since we want to know total active sellers and clients, let's keep it simple.
        if (teamTab === 'user') {
           setTotalUsers(data.totalUsers || 0);
        }
      } catch (err) {
        console.log('Could not fetch users');
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchRequests = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/upgrade/pending`);
        setUpgradeRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log('Could not fetch upgrade requests');
      } finally {
        setLoadingRequests(false);
      }
    };

    const fetchTasks = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/task/all`);
        setTasks(data);
      } catch (err) { console.log('Could not fetch tasks'); }
      finally { setLoadingTasks(false); }
    };

    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/review/get`);
        setReviews(data);
      } catch (err) { console.log('Could not fetch reviews'); }
      finally { setLoadingReviews(false); }
    };

    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/stats/platform`, { params: { range } });
        setStats(data);
      } catch (err) { console.log('Could not fetch stats'); }
      finally { setLoadingStats(false); }
    };

    fetchUsers();
    fetchRequests();
    fetchTasks();
    fetchReviews();
    fetchStats();
  }, [currentUser._id, teamTab, range]);

  const handleApprove = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/upgrade/approve/${id}`);
      setUpgradeRequests(prev => prev.filter(r => r._id !== id));
      toast.success(t('request_approved_upgraded'));
    } catch (err) {
      toast.error(t('failed_approve_request'));
    }
  };

  const handleDeny = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/upgrade/deny/${id}`);
      setUpgradeRequests(prev => prev.filter(r => r._id !== id));
      toast.success(t('request_denied'));
    } catch (err) {
      toast.error(t('failed_deny_request'));
    }
  };

  const handleTaskCreated = (newTask) => {
    if (taskToEdit) {
      setTasks(tasks.map(t => t._id === newTask._id ? newTask : t));
    } else {
      setTasks([newTask, ...tasks]);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm(t('delete_task_confirm'))) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/task/delete/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success(t('task_deleted_success'));
    } catch (error) {
      toast.error(t('failed_delete_task'));
    }
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleReviewAdded = (review) => {
    if (reviewToEdit) {
      setReviews(reviews.map(r => r._id === review._id ? review : r));
    } else {
      setReviews([review, ...reviews]);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm(t('delete_testimonial_confirm'))) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/review/delete/${id}`);
      setReviews(reviews.filter(r => r._id !== id));
      toast.success(t('review_deleted_success'));
    } catch (err) { toast.error(t('failed_delete_review')); }
  };

  const handleEditReview = (review) => {
    setReviewToEdit(review);
    setIsReviewModalOpen(true);
  };

  return (
    <AnimatedPage>
      <div className='min-h-screen pt-24 pb-10 px-4 max-w-6xl mx-auto'>

        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4'>
          <div>
            <div className='flex items-center gap-2 mb-1'>
              <FaUserShield className='text-indigo-600' />
              <p className='text-sm text-indigo-600 font-bold uppercase tracking-wider'>{t('admin_panel')}</p>
            </div>
            <h1 className='text-3xl font-extrabold text-slate-900'>{t('admin_dashboard')}</h1>
            <p className='text-slate-500 font-light mt-1'>{t('manage_users_desc')}</p>
          </div>
          <div className='flex items-center gap-3 self-start sm:self-auto'>
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className='text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm'
            >
              <FaClock size={12} /> {t('create_task')}
            </button>
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className='text-xs font-bold bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm'
            >
              <FaArrowUp size={12} /> {t('add_review')}
            </button>
            <Link
              to='/profile'
              className='text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1'
            >
              {t('settings')} <FaChevronRight className='text-[10px]' />
            </Link>
          </div>
        </div>

        <TaskModal 
            isOpen={isTaskModalOpen} 
            onClose={() => {
                setIsTaskModalOpen(false);
                setTaskToEdit(null);
            }} 
            onTaskCreated={handleTaskCreated} 
            taskToEdit={taskToEdit}
        />

        <AddReviewModal 
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setReviewToEdit(null);
          }}
          onReviewAdded={handleReviewAdded}
          reviewToEdit={reviewToEdit}
        />

        {/* Analytics Section */}
        <div className='mb-12'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-bold text-slate-900 flex items-center gap-2'>
              <FaChartLine className='text-indigo-600' /> {t('financial_analytics')}
            </h2>
            <select 
               value={range} 
               onChange={(e) => setRange(e.target.value)}
               className='text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none cursor-pointer'
            >
              <option value="today">{t('today')}</option>
              <option value="week">{t('last_7_days')}</option>
              <option value="month">{t('last_30_days')}</option>
              <option value="year">{t('this_year')}</option>
            </select>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
             <StatCard 
                title={t('global_revenue')} 
                value={`${stats?.totalIncome?.toLocaleString() || 0} ${t('currency')}`} 
                icon={FaWallet} 
                colorClass="bg-indigo-600"
             />
             <StatCard 
                title={t('platform_listings')} 
                value={stats?.inventoryStats?.reduce((acc, curr) => acc + curr.count, 0) || 0} 
                icon={FaBuilding} 
                colorClass="bg-slate-900" 
             />
             <StatCard 
                title={t('approved_bookings')} 
                value={stats?.bookingStatusCounts?.find(s => s._id === 'approved')?.count || 0} 
                icon={FaClipboardCheck} 
                colorClass="bg-emerald-600" 
             />
             <StatCard 
                title={t('pending_requests')} 
                value={stats?.bookingStatusCounts?.find(s => s._id === 'pending')?.count || 0} 
                icon={FaClock} 
                colorClass="bg-amber-500" 
             />
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-1 gap-6 h-[400px]'>
             <AnalyticsChart 
                data={stats?.revenueStats || []} 
                title={t('income_trend')} 
                dataKey="income" 
                color="#4f46e5"
             />
          </div>
        </div>

        {/* System Management Summary */}
        <div className='mb-6'>
           <h2 className='text-sm font-bold text-slate-400 uppercase tracking-widest mb-4'>{t('system_management')}</h2>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>

          {/* Upgrade Requests */}
          <div className='lg:col-span-2 bg-white border border-slate-100 rounded-2xl overflow-hidden'>
            <div className='px-6 py-5 border-b border-slate-100'>
              <div className='flex items-center gap-2'>
                <FaArrowUp className='text-indigo-600 text-sm' />
                <h2 className='text-lg font-bold text-slate-900'>{t('upgrade_requests')}</h2>
              </div>
              <p className='text-xs text-slate-400 mt-0.5'>{t('upgrade_requests_desc')}</p>
            </div>

            {loadingRequests ? (
              <div className='flex items-center justify-center py-12'>
                <div className='w-7 h-7 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin'></div>
              </div>
            ) : upgradeRequests.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-center px-6'>
                <div className='w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3'>
                  <FaCheck className='text-emerald-500' />
                </div>
                <p className='text-sm font-semibold text-slate-700'>{t('all_clear')}</p>
                <p className='text-xs text-slate-400'>{t('no_pending_requests')}</p>
              </div>
            ) : (
              <div className='divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar'>
                {upgradeRequests.map((req) => (
                  <div key={req._id} className='px-5 py-4'>
                    <div className='flex items-center gap-3 mb-3'>
                      <img
                        src={req.userId?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                        alt='user'
                        className='w-9 h-9 rounded-full object-cover border border-slate-200'
                      />
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm font-semibold text-slate-800 truncate'>{req.fullName}</p>
                        <p className='text-[11px] text-slate-400 truncate'>{req.userId?.email}</p>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-2 text-[11px] mb-3'>
                      <div className='bg-slate-50 rounded-lg px-2.5 py-1.5'>
                        <span className='text-slate-400'>{t('business')}</span>
                        <p className='font-semibold text-slate-700 truncate'>{req.businessName}</p>
                      </div>
                      <div className='bg-slate-50 rounded-lg px-2.5 py-1.5'>
                        <span className='text-slate-400'>{t('speciality')}</span>
                        <p className='font-semibold text-slate-700 truncate'>{req.speciality}</p>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <button onClick={() => handleApprove(req._id)} className='flex-1 flex items-center justify-center gap-1 bg-emerald-600 text-white text-[11px] font-medium py-2 rounded-lg hover:bg-emerald-700 transition-colors'>
                        <FaCheck className='text-[9px]' /> {t('approve')}
                      </button>
                      <button onClick={() => handleDeny(req._id)} className='flex-1 flex items-center justify-center gap-1 bg-white text-red-600 border border-red-200 text-[11px] font-medium py-2 rounded-lg hover:bg-red-50 transition-colors'>
                        <FaTimes className='text-[9px]' /> {t('deny')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Team Members */}
          <div className='lg:col-span-3 bg-white border border-slate-100 rounded-2xl overflow-hidden'>
            <div className='px-6 py-5 border-b border-slate-100 flex items-center justify-between'>
              <div>
                <h2 className='text-lg font-bold text-slate-900'>{t('team_members')}</h2>
                <div className="flex gap-4 mt-2">
                  <button onClick={() => setTeamTab('user')} className={`text-xs font-bold ${teamTab === 'user' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>{t('sellers')}</button>
                  <button onClick={() => setTeamTab('client')} className={`text-xs font-bold ${teamTab === 'client' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>{t('clients')}</button>
                </div>
              </div>
              <Link to='/admin/users' className='text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors'>
                {t('manage_all_users')} →
              </Link>
            </div>

            {loadingUsers ? (
              <div className='flex items-center justify-center py-16'>
                <div className='w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin'></div>
              </div>
            ) : users.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-16 text-center'>
                <div className='w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3'>
                  <FaUsers className='text-slate-300 text-xl' />
                </div>
                <p className='text-sm font-semibold text-slate-700'>{t('no_team_members')}</p>
                <p className='text-xs text-slate-400'>{t('no_users_assigned')}</p>
              </div>
            ) : (
              <div className='divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar'>
                {users.map((user) => (
                  <div key={user._id} className='flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/50 transition-colors'>
                    <img
                      src={user.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                      alt={user.username}
                      className='w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0'
                    />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-semibold text-slate-800 truncate'>{user.username}</p>
                      <div className='flex items-center gap-1 mt-0.5'>
                        <FaEnvelope className='text-[9px] text-slate-300' />
                        <p className='text-[11px] text-slate-400 truncate'>{user.email}</p>
                      </div>
                    </div>
                    <div className='flex flex-col items-end gap-1 flex-shrink-0'>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        user.role === 'user' ? 'bg-emerald-50 text-emerald-600' :
                        user.role === 'client' ? 'bg-slate-100 text-slate-500' :
                        'bg-indigo-50 text-indigo-600'
                      }`}>
                        {user.role === 'user' ? t('seller_label') : t(user.role)}
                      </span>
                      <p className='text-[9px] text-slate-400 font-bold'>{t('score')}: {user.activityScore || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manage Tasks Section */}
          <div className='lg:col-span-2 bg-white border border-slate-100 rounded-2xl overflow-hidden'>
            <div className='px-6 py-5 border-b border-slate-100'>
              <div className='flex items-center gap-2'>
                <FaClock className='text-indigo-600 text-sm' />
                <h2 className='text-lg font-bold text-slate-900'>{t('my_tasks')}</h2>
              </div>
              <p className='text-xs text-slate-400 mt-0.5'>{t('task_assignments_desc')}</p>
            </div>

            {loadingTasks ? (
              <div className='flex items-center justify-center py-12'>
                <div className='w-7 h-7 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin'></div>
              </div>
            ) : tasks.length === 0 ? (
              <div className='py-12 text-center px-6'>
                <p className='text-sm text-slate-400'>{t('no_tasks_yet')}</p>
              </div>
            ) : (
              <div className='divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar'>
                {tasks.map((task) => (
                  <div key={task._id} className='px-5 py-4 flex items-center justify-between group hover:bg-slate-50 transition-colors'>
                    <div className='min-w-0 flex-1'>
                      <p className='text-sm font-semibold text-slate-800 truncate'>{task.title}</p>
                      <p className='text-[11px] text-slate-400'>{task.date} • {task.time}</p>
                    </div>
                    <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <button 
                          onClick={() => handleEditTask(task)}
                          className='p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-900 hover:text-white transition-all'
                          title={t('edit_task')}
                      >
                          <FaCheck className='text-[10px]' />
                      </button>
                      <button 
                          onClick={() => handleDeleteTask(task._id)}
                          className='p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all'
                          title={t('delete_task_title')}
                      >
                          <FaTimes className='text-[10px]' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manage Reviews Section */}
          <div className='lg:col-span-3 bg-white border border-slate-100 rounded-2xl overflow-hidden'>
            <div className='px-6 py-5 border-b border-slate-100'>
              <div className='flex items-center gap-2'>
                <FaStar className='text-emerald-600 text-sm' />
                <h2 className='text-lg font-bold text-slate-900'>{t('manage_testimonials')}</h2>
              </div>
              <p className='text-xs text-slate-400 mt-0.5'>{t('review_community_desc')}</p>
            </div>

            {loadingReviews ? (
              <div className='flex items-center justify-center py-12'>
                <div className='w-7 h-7 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin'></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className='py-12 text-center px-6'>
                <p className='text-sm text-slate-400'>{t('no_reviews_found')}</p>
              </div>
            ) : (
              <div className='divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar'>
                {reviews.map((review) => (
                  <div key={review._id} className='px-5 py-4 flex items-center justify-between group hover:bg-slate-50 transition-colors'>
                    <div className='flex items-center gap-3 min-w-0 flex-1'>
                      <img src={review.authorAvatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} alt='' className='w-8 h-8 rounded-full object-cover border border-slate-100' />
                      <div className='min-w-0'>
                        <p className='text-sm font-semibold text-slate-800 truncate'>{review.authorName}</p>
                        <p className='text-[10px] text-slate-400 truncate'>{review.profession}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <div className='flex text-amber-500 gap-0.5 mr-2 hidden sm:flex'>
                        {[...Array(review.rating)].map((_, i) => <FaStar key={i} size={8} />)}
                      </div>
                      <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                        <button 
                            onClick={() => handleEditReview(review)}
                            className='p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-900 hover:text-white transition-all'
                            title={t('edit_review')}
                        >
                            <FaEdit className='text-[10px]' />
                        </button>
                        <button 
                            onClick={() => handleDeleteReview(review._id)}
                            className='p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all'
                            title={t('delete_review_title')}
                        >
                            <FaTrash className='text-[10px]' />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
