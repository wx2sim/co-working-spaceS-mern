import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AnimatedPage from '../../components/AnimatedPage';
import {
  FaUsers, FaCrown, FaArrowUp, FaCheck, FaTimes, FaChevronRight,
  FaClipboardList, FaUserShield, FaDoorOpen, FaEnvelope, FaSearch, FaClock, FaStar, FaEdit, FaTrash
} from 'react-icons/fa';
import TaskModal from '../../components/TaskModal';
import AddReviewModal from '../../components/AddReviewModal';
import StatCard from '../../components/StatCard';
import AnalyticsChart from '../../components/AnalyticsChart';
import { FaWallet, FaChartLine, FaClipboardCheck, FaBuilding, FaGlobe } from 'react-icons/fa';

export default function SuperAdminDashboard() {
  const { currentUser } = useSelector((state) => state.user);
  const [allUsers, setAllUsers] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [upgradeRequests, setUpgradeRequests] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '' });
  const [creatingAdmin, setCreatingAdmin] = useState(false);
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
  const [days, setDays] = useState(30);
  const [selectedSeller, setSelectedSeller] = useState('all');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${currentUser._id}`, {
          params: { limit: 1000 } // SuperAdmin might want a larger list or I should add pagination here too, but for now let's just fix the fetch.
        });
        setAllUsers(data.users || []);
      } catch (err) { console.log('Could not fetch users'); }
      finally { setLoadingUsers(false); }
    };

    const fetchListings = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/listing/get?limit=100`);
        setAllListings(Array.isArray(data) ? data : []);
      } catch (err) { console.log('Could not fetch listings'); }
      finally { setLoadingListings(false); }
    };

    const fetchRequests = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/upgrade/pending`);
        setUpgradeRequests(Array.isArray(data) ? data : []);
      } catch (err) { console.log('Could not fetch requests'); }
      finally { setLoadingRequests(false); }
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
        const endpoint = selectedSeller === 'all' ? `${import.meta.env.VITE_API_BASE_URL}/api/stats/platform` : `${import.meta.env.VITE_API_BASE_URL}/api/stats/owner`;
        const { data } = await axios.get(endpoint, { 
          params: { days, targetId: selectedSeller === 'all' ? undefined : selectedSeller } 
        });
        setStats(data);
      } catch (err) { console.log('Could not fetch stats'); }
      finally { setLoadingStats(false); }
    };

    fetchAll();
    fetchListings();
    fetchRequests();
    fetchTasks();
    fetchReviews();
    fetchStats();
  }, [currentUser._id, days, selectedSeller]);

  const handleApprove = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/upgrade/approve/${id}`);
      setUpgradeRequests(prev => prev.filter(r => r._id !== id));
      toast.success('Upgrade approved!');
    } catch (err) { toast.error('Failed.'); }
  };

  const handleDeny = async (id) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/upgrade/deny/${id}`);
      setUpgradeRequests(prev => prev.filter(r => r._id !== id));
      toast.success('Request denied.');
    } catch (err) { toast.error('Failed.'); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/admin/role/${userId}`, { role: newRole });
      setAllUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success(`User role updated to ${newRole === 'user' ? 'seller' : newRole}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const roleCount = (role) => allUsers.filter(u => u.role === role).length;
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreatingAdmin(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/admin/create-admin`, newAdmin);
      toast.success('Admin created successfully!');
      setAllUsers([data, ...allUsers]);
      setNewAdmin({ username: '', email: '', password: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create admin');
    } finally {
      setCreatingAdmin(false);
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
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/task/delete/${taskId}`);
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

  const handleReviewAdded = (review) => {
    if (reviewToEdit) {
      setReviews(reviews.map(r => r._id === review._id ? review : r));
    } else {
      setReviews([review, ...reviews]);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/review/delete/${id}`);
      setReviews(reviews.filter(r => r._id !== id));
      toast.success('Review deleted');
    } catch (err) { toast.error('Failed to delete'); }
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
              <FaCrown className='text-amber-500' />
              <p className='text-sm text-amber-600 font-bold uppercase tracking-wider'>Super Admin</p>
            </div>
            <h1 className='text-3xl font-extrabold text-slate-900'>System Overview</h1>
            <p className='text-slate-500 font-light mt-1'>Full control over the platform.</p>
          </div>
          <div className='flex items-center gap-3 self-start sm:self-auto'>
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className='text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm'
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
              Settings <FaChevronRight className='text-[10px]' />
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

        <div className='mb-12'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4'>
            <h2 className='text-xl font-bold text-slate-900 flex items-center gap-2'>
              <FaGlobe className='text-indigo-600' /> {selectedSeller === 'all' ? 'Platform Analytics' : 'Seller Analytics'}
            </h2>
            <div className='flex items-center gap-3'>
              <select 
                value={selectedSeller}
                onChange={(e) => setSelectedSeller(e.target.value)}
                className='text-[10px] font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none cursor-pointer tracking-wider uppercase'
              >
                <option value="all">Global (All Sellers)</option>
                {allUsers.filter(u => u.role === 'user').map(seller => (
                  <option key={seller._id} value={seller._id}>{seller.username}</option>
                ))}
              </select>
              <select 
                value={days} 
                onChange={(e) => setDays(e.target.value)}
                className='text-[10px] font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none cursor-pointer tracking-wider uppercase'
              >
                <option value={7}>7 Days</option>
                <option value={30}>30 Days</option>
                <option value={90}>90 Days</option>
              </select>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
             <StatCard 
                title={selectedSeller === 'all' ? "Global Revenue" : "Seller Revenue"}
                value={`${stats?.totalIncome?.toLocaleString() || 0} DA`} 
                icon={FaWallet} 
                colorClass="bg-indigo-600"
             />
             <StatCard 
                title="Total Listings" 
                value={selectedSeller === 'all' ? allListings.length : (stats?.inventoryStats?.reduce((acc, curr) => acc + curr.count, 0) || 0)} 
                icon={FaBuilding} 
                colorClass="bg-slate-900" 
             />
             <StatCard 
                title={selectedSeller === 'all' ? "Active Sellers" : "Approved Bookings"} 
                value={selectedSeller === 'all' ? roleCount('user') : (stats?.bookingStatusCounts?.find(s => s._id === 'approved')?.count || 0)} 
                icon={selectedSeller === 'all' ? FaUserShield : FaClipboardCheck} 
                colorClass={selectedSeller === 'all' ? "bg-amber-500" : "bg-emerald-600"} 
             />
             <StatCard 
                title={selectedSeller === 'all' ? "Total Users" : "Pending Requests"} 
                value={selectedSeller === 'all' ? allUsers.length : (stats?.bookingStatusCounts?.find(s => s._id === 'pending')?.count || 0)} 
                icon={selectedSeller === 'all' ? FaUsers : FaClock} 
                colorClass={selectedSeller === 'all' ? "bg-emerald-600" : "bg-amber-500"} 
             />
          </div>

          <div className={`grid grid-cols-1 ${selectedSeller === 'all' ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
             <div className='h-[350px]'>
               <AnalyticsChart 
                  data={stats?.revenueStats || []} 
                  title={selectedSeller === 'all' ? "Platform Income Growth" : "Seller Income Growth"} 
                  dataKey="income" 
                  color="#4f46e5"
               />
             </div>
             {selectedSeller === 'all' && (
               <div className='h-[350px]'>
                 <AnalyticsChart 
                    data={stats?.userGrowth || []} 
                    type="bar" 
                    title="New User Registration" 
                    dataKey="count" 
                    color="#10b981"
                 />
               </div>
             )}
          </div>
        </div>

        <div className='mb-6'>
           <h2 className='text-sm font-bold text-slate-400 uppercase tracking-widest mb-4'>System Assets & Management</h2>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

          {/* Users Table */}
          <div className='lg:col-span-2 bg-white border border-slate-100 rounded-2xl overflow-hidden'>
            <div className='px-6 py-4 border-b border-slate-100'>
              <div className='flex items-center justify-between mb-3'>
                <h2 className='text-lg font-bold text-slate-900'>All Users</h2>
                <span className='text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full'>{filteredUsers.length} total</span>
              </div>
              <div className='flex flex-col sm:flex-row gap-2'>
                <div className='flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2'>
                  <FaSearch className='text-slate-400 text-xs' />
                  <input
                    type='text'
                    placeholder='Search users...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='bg-transparent text-sm w-full focus:outline-none text-slate-700 placeholder-slate-400'
                  />
                </div>
                <select 
                  className='bg-slate-50 border border-slate-200 text-sm font-medium text-slate-600 rounded-lg px-3 py-2 focus:outline-none hover:bg-slate-100 transition-colors cursor-pointer'
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="user">Sellers</option>
                  <option value="client">Clients</option>
                </select>
              </div>
            </div>

            {loadingUsers ? (
              <div className='flex items-center justify-center py-16'>
                <div className='w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin'></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <FaUsers className='text-3xl text-slate-200 mb-2' />
                <p className='text-sm text-slate-400'>{searchTerm ? 'No users match your search.' : 'No users found.'}</p>
              </div>
            ) : (
              <div className='divide-y divide-slate-50 max-h-[420px] overflow-y-auto custom-scrollbar'>
                {filteredUsers.map((user) => (
                  <div key={user._id} className='flex items-center gap-3 px-6 py-3 hover:bg-slate-50/50 transition-colors'>
                    <img
                      src={user.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                      alt={user.username}
                      className='w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0'
                    />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-semibold text-slate-800 truncate'>{user.username}</p>
                      <div className='flex items-center gap-1'>
                        <FaEnvelope className='text-[8px] text-slate-300' />
                        <p className='text-[11px] text-slate-400 truncate'>{user.email}</p>
                      </div>
                    </div>
                    {user.role === 'superadmin' ? (
                      <span className='bg-amber-100 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0'>
                        superadmin
                      </span>
                    ) : (
                      <select 
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex-shrink-0 cursor-pointer border border-transparent hover:border-slate-300 focus:ring-0 outline-none ${
                          user.role === 'admin' ? 'bg-indigo-50 text-indigo-600' :
                          user.role === 'user' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-slate-100 text-slate-500'
                        }`}
                        title="Change user role"
                      >
                        <option value="client" className="bg-white text-slate-700 font-bold uppercase">Client</option>
                        <option value="user" className="bg-white text-slate-700 font-bold uppercase">Seller</option>
                        <option value="admin" className="bg-white text-slate-700 font-bold uppercase">Admin</option>
                      </select>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className='flex flex-col gap-5'>

            {/* Create Admin Form */}
            <div className='bg-indigo-600 text-white border border-indigo-500 rounded-2xl overflow-hidden shadow-lg shadow-indigo-600/20'>
              <div className='px-5 py-4 border-b border-indigo-500/50'>
                <div className='flex items-center gap-2'>
                  <FaUserShield className='text-indigo-200 text-xs' />
                  <h3 className='text-sm font-bold'>Add New Admin</h3>
                </div>
              </div>
              <form onSubmit={handleCreateAdmin} className='p-5 flex flex-col gap-3 relative'>
                <input 
                  type='text' 
                  placeholder='Admin Name' 
                  required
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                  className='bg-indigo-700/50 border border-indigo-500 text-white placeholder-indigo-300 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-white transition-all w-full'
                />
                <input 
                  type='email' 
                  placeholder='Email Address' 
                  required
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  className='bg-indigo-700/50 border border-indigo-500 text-white placeholder-indigo-300 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-white transition-all w-full'
                />
                <input 
                  type='password' 
                  placeholder='Password' 
                  required
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                  className='bg-indigo-700/50 border border-indigo-500 text-white placeholder-indigo-300 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-white transition-all w-full'
                />
                <button 
                  type='submit' 
                  disabled={creatingAdmin}
                  className='bg-white text-indigo-700 font-bold text-xs py-2.5 rounded-lg hover:bg-slate-100 transition-colors mt-1 disabled:opacity-70 flex items-center justify-center'
                >
                  {creatingAdmin ? 'Creating...' : 'Register Admin Account'}
                </button>
              </form>
            </div>

            {/* Pending Upgrades */}
            <div className='bg-white border border-slate-100 rounded-2xl overflow-hidden'>
              <div className='px-5 py-4 border-b border-slate-100'>
                <div className='flex items-center gap-2'>
                  <FaArrowUp className='text-indigo-600 text-xs' />
                  <h3 className='text-sm font-bold text-slate-900'>Pending Upgrades</h3>
                </div>
              </div>

              {loadingRequests ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin'></div>
                </div>
              ) : upgradeRequests.length === 0 ? (
                <div className='flex flex-col items-center py-8 text-center px-4'>
                  <FaCheck className='text-emerald-400 text-xl mb-2' />
                  <p className='text-xs text-slate-400'>No pending requests</p>
                </div>
              ) : (
                <div className='divide-y divide-slate-50 max-h-[250px] overflow-y-auto custom-scrollbar'>
                  {upgradeRequests.map((req) => (
                    <div key={req._id} className='px-4 py-3'>
                      <div className='flex items-center gap-2 mb-2'>
                        <img src={req.userId?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} alt='user' className='w-7 h-7 rounded-full object-cover border border-slate-200' />
                        <div className='min-w-0 flex-1'>
                          <p className='text-xs font-semibold text-slate-800 truncate'>{req.fullName}</p>
                          <p className='text-[10px] text-slate-400 truncate'>{req.businessName}</p>
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        <button onClick={() => handleApprove(req._id)} className='flex-1 text-[10px] font-medium py-1.5 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors'>
                          Approve
                        </button>
                        <button onClick={() => handleDeny(req._id)} className='flex-1 text-[10px] font-medium py-1.5 rounded-md bg-white text-red-500 border border-red-200 hover:bg-red-50 transition-colors'>
                          Deny
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Listings */}
            <div className='bg-white border border-slate-100 rounded-2xl overflow-hidden'>
              <div className='px-5 py-4 border-b border-slate-100 flex items-center justify-between'>
                <h3 className='text-sm font-bold text-slate-900'>Recent Listings</h3>
                <Link to='/search' className='text-[11px] font-semibold text-slate-400 hover:text-slate-900 transition-colors'>All →</Link>
              </div>
              {loadingListings ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin'></div>
                </div>
              ) : allListings.length === 0 ? (
                <div className='py-8 text-center'>
                  <p className='text-xs text-slate-400'>No listings yet.</p>
                </div>
              ) : (
                <div className='divide-y divide-slate-50 max-h-[200px] overflow-y-auto custom-scrollbar'>
                  {allListings.slice(0, 5).map((listing) => (
                    <Link key={listing._id} to={`/listing/${listing._id}`} className='flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50/50 transition-colors group'>
                      <img src={listing.imageUrls?.[0] || ''} alt={listing.name} className='w-10 h-8 rounded-md object-cover bg-slate-100 flex-shrink-0' />
                      <div className='min-w-0 flex-1'>
                        <p className='text-xs font-semibold text-slate-700 truncate group-hover:text-indigo-600 transition-colors'>{listing.name}</p>
                        <p className='text-[10px] text-slate-400 truncate'>{listing.address}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${listing.type === 'rent' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {listing.type}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Manage Tasks Section */}
          <div className='bg-white border border-slate-100 rounded-2xl overflow-hidden'>
            <div className='px-5 py-4 border-b border-slate-100'>
              <div className='flex items-center gap-2'>
                <FaClock className='text-indigo-600 text-xs' />
                <h3 className='text-sm font-bold text-slate-900'>System Tasks</h3>
              </div>
            </div>
            {loadingTasks ? (
              <div className='flex items-center justify-center py-8'>
                <div className='w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin'></div>
              </div>
            ) : tasks.length === 0 ? (
              <div className='py-8 text-center px-4'>
                <p className='text-xs text-slate-400'>No tasks created yet.</p>
              </div>
            ) : (
              <div className='divide-y divide-slate-50 max-h-[300px] overflow-y-auto custom-scrollbar'>
                {tasks.map((task) => (
                  <div key={task._id} className='px-4 py-3 flex items-center justify-between group hover:bg-slate-50 transition-colors'>
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs font-semibold text-slate-800 truncate'>{task.title}</p>
                      <p className='text-[10px] text-slate-400'>{task.date} • {task.time}</p>
                    </div>
                    <div className='flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <button 
                          onClick={() => handleEditTask(task)}
                          className='w-7 h-7 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all'
                          title='Edit Task'
                      >
                          <FaCheck className='text-[10px]' /> 
                      </button>
                      <button 
                          onClick={() => handleDeleteTask(task._id)}
                          className='w-7 h-7 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition-all'
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

          {/* Manage Reviews Section */}
          <div className='bg-white border border-slate-100 rounded-2xl overflow-hidden'>
            <div className='px-5 py-4 border-b border-slate-100'>
              <div className='flex items-center gap-2'>
                <FaStar className='text-emerald-600 text-xs' />
                <h3 className='text-sm font-bold text-slate-900'>Manage Testimonials</h3>
              </div>
            </div>

            {loadingReviews ? (
              <div className='flex items-center justify-center py-8'>
                <div className='w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin'></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className='py-8 text-center px-4'>
                <p className='text-xs text-slate-400'>No reviews found.</p>
              </div>
            ) : (
              <div className='divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar'>
                {reviews.map((review) => (
                  <div key={review._id} className='px-4 py-3 flex items-center justify-between group hover:bg-slate-50 transition-colors'>
                    <div className='flex items-center gap-2 min-w-0 flex-1'>
                      <img src={review.authorAvatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} alt='' className='w-7 h-7 rounded-full object-cover border border-slate-100' />
                      <div className='min-w-0'>
                        <p className='text-[11px] font-semibold text-slate-800 truncate'>{review.authorName}</p>
                        <p className='text-[9px] text-slate-400 truncate'>{review.profession}</p>
                      </div>
                    </div>
                    <div className='flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <button 
                          onClick={() => handleEditReview(review)}
                          className='w-7 h-7 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all'
                          title='Edit Review'
                      >
                          <FaEdit className='text-[10px]' /> 
                      </button>
                      <button 
                          onClick={() => handleDeleteReview(review._id)}
                          className='w-7 h-7 bg-red-50 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-600 hover:text-white transition-all'
                          title='Delete Review'
                      >
                          <FaTrash className='text-[10px]' />
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
