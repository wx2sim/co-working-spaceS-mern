import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AnimatedPage from '../../components/AnimatedPage';
import {
  FaUsers, FaArrowUp, FaCheck, FaTimes, FaUserShield,
  FaClipboardList, FaChevronRight, FaEnvelope, FaClock
} from 'react-icons/fa';
import TaskModal from '../../components/TaskModal';
import AddReviewModal from '../../components/AddReviewModal';

export default function AdminDashboard() {
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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`/api/admin/users/${currentUser._id}`, {
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
        const { data } = await axios.get('/api/upgrade/pending');
        setUpgradeRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log('Could not fetch upgrade requests');
      } finally {
        setLoadingRequests(false);
      }
    };

    const fetchTasks = async () => {
      try {
        const { data } = await axios.get('/api/task/all');
        setTasks(data);
      } catch (err) { console.log('Could not fetch tasks'); }
      finally { setLoadingTasks(false); }
    };

    fetchUsers();
    fetchRequests();
    fetchTasks();
  }, [currentUser._id, teamTab]);

  const handleApprove = async (id) => {
    try {
      await axios.post(`/api/upgrade/approve/${id}`);
      setUpgradeRequests(prev => prev.filter(r => r._id !== id));
      toast.success('Request approved! User upgraded to seller.');
    } catch (err) {
      toast.error('Failed to approve request.');
    }
  };

  const handleDeny = async (id) => {
    try {
      await axios.post(`/api/upgrade/deny/${id}`);
      setUpgradeRequests(prev => prev.filter(r => r._id !== id));
      toast.success('Request denied.');
    } catch (err) {
      toast.error('Failed to deny request.');
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
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`/api/task/delete/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  return (
    <AnimatedPage>
      <div className='min-h-screen pt-24 pb-10 px-4 max-w-6xl mx-auto'>

        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4'>
          <div>
            <div className='flex items-center gap-2 mb-1'>
              <FaUserShield className='text-indigo-600' />
              <p className='text-sm text-indigo-600 font-bold uppercase tracking-wider'>Admin Panel</p>
            </div>
            <h1 className='text-3xl font-extrabold text-slate-900'>Admin Dashboard</h1>
            <p className='text-slate-500 font-light mt-1'>Manage users and upgrade requests.</p>
          </div>
          <div className='flex items-center gap-3 self-start sm:self-auto'>
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className='text-xs font-bold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm'
            >
              <FaClock size={12} /> Create Task
            </button>
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className='text-xs font-bold bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm'
            >
              <FaArrowUp size={12} /> Add Review
            </button>
            <Link
              to='/profile'
              className='text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1'
            >
              Account Settings <FaChevronRight className='text-[10px]' />
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
          onClose={() => setIsReviewModalOpen(false)}
          onReviewAdded={() => {}}
        />

        {/* Stats */}
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-8'>
          <div className='bg-white border border-slate-100 rounded-2xl p-5'>
            <div className='flex items-center justify-between mb-3'>
              <div className='w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center'>
                <FaUsers className='text-white text-sm' />
              </div>
              <span className='text-2xl font-extrabold text-slate-900'>{totalUsers}</span>
            </div>
            <p className='text-xs text-slate-400 font-medium'>Platform Users</p>
          </div>
          <div className='bg-white border border-slate-100 rounded-2xl p-5'>
            <div className='flex items-center justify-between mb-3'>
              <div className='w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center'>
                <FaArrowUp className='text-white text-sm' />
              </div>
              <span className='text-2xl font-extrabold text-slate-900'>{upgradeRequests.length}</span>
            </div>
            <p className='text-xs text-slate-400 font-medium'>Pending Upgrades</p>
          </div>
          <div className='bg-white border border-slate-100 rounded-2xl p-5 col-span-2 md:col-span-1'>
            <div className='flex items-center justify-between mb-3'>
              <div className='w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center'>
                <FaClipboardList className='text-white text-sm' />
              </div>
              <span className='text-2xl font-extrabold text-slate-900'>{totalUsers > 0 ? users.filter(u => u.role === 'user').length : 0}</span>
            </div>
            <p className='text-xs text-slate-400 font-medium'>Active Sellers</p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>

          {/* Upgrade Requests */}
          <div className='lg:col-span-2 bg-white border border-slate-100 rounded-2xl overflow-hidden'>
            <div className='px-6 py-5 border-b border-slate-100'>
              <div className='flex items-center gap-2'>
                <FaArrowUp className='text-indigo-600 text-sm' />
                <h2 className='text-lg font-bold text-slate-900'>Upgrade Requests</h2>
              </div>
              <p className='text-xs text-slate-400 mt-0.5'>Clients requesting seller accounts</p>
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
                <p className='text-sm font-semibold text-slate-700'>All clear!</p>
                <p className='text-xs text-slate-400'>No pending requests right now.</p>
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
                        <span className='text-slate-400'>Business</span>
                        <p className='font-semibold text-slate-700 truncate'>{req.businessName}</p>
                      </div>
                      <div className='bg-slate-50 rounded-lg px-2.5 py-1.5'>
                        <span className='text-slate-400'>Speciality</span>
                        <p className='font-semibold text-slate-700 truncate'>{req.speciality}</p>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <button onClick={() => handleApprove(req._id)} className='flex-1 flex items-center justify-center gap-1 bg-emerald-600 text-white text-[11px] font-medium py-2 rounded-lg hover:bg-emerald-700 transition-colors'>
                        <FaCheck className='text-[9px]' /> Approve
                      </button>
                      <button onClick={() => handleDeny(req._id)} className='flex-1 flex items-center justify-center gap-1 bg-white text-red-600 border border-red-200 text-[11px] font-medium py-2 rounded-lg hover:bg-red-50 transition-colors'>
                        <FaTimes className='text-[9px]' /> Deny
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
                <h2 className='text-lg font-bold text-slate-900'>Team Members</h2>
                <div className="flex gap-4 mt-2">
                  <button onClick={() => setTeamTab('user')} className={`text-xs font-bold ${teamTab === 'user' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Sellers</button>
                  <button onClick={() => setTeamTab('client')} className={`text-xs font-bold ${teamTab === 'client' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Clients</button>
                </div>
              </div>
              <Link to='/admin/users' className='text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors'>
                Manage All Users →
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
                <p className='text-sm font-semibold text-slate-700'>No team members</p>
                <p className='text-xs text-slate-400'>You don't have any users assigned yet.</p>
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
                        {user.role === 'user' ? 'Seller' : user.role}
                      </span>
                      <p className='text-[9px] text-slate-400 font-bold'>Score: {user.activityScore || 0}</p>
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
                <h2 className='text-lg font-bold text-slate-900'>My Tasks</h2>
              </div>
              <p className='text-xs text-slate-400 mt-0.5'>Edit or remove system assignments</p>
            </div>

            {loadingTasks ? (
              <div className='flex items-center justify-center py-12'>
                <div className='w-7 h-7 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin'></div>
              </div>
            ) : tasks.length === 0 ? (
              <div className='py-12 text-center px-6'>
                <p className='text-sm text-slate-400'>No tasks made yet.</p>
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
                          title='Edit Task'
                      >
                          <FaCheck className='text-[10px]' />
                      </button>
                      <button 
                          onClick={() => handleDeleteTask(task._id)}
                          className='p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all'
                          title='Delete Task'
                      >
                          <FaTimes className='text-[10px]' />
                      </button>
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
