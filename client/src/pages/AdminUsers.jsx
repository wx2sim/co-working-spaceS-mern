import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import AnimatedPage from '../components/AnimatedPage';
import { FaUserShield, FaSearch, FaEnvelope, FaShieldAlt, FaTrash, FaSortAmountDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [startIndex, setStartIndex] = useState(0);
  const [limit] = useState(9);
  const [totalUsers, setTotalUsers] = useState(0);
  const [sort, setSort] = useState('activityScore');
  const [order, setOrder] = useState('desc');
  const [activeTab, setActiveTab] = useState('client');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Protective routing
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) {
     return <Navigate to='/error/401' />;
  }

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/admin/users/${currentUser._id}`, {
        params: {
          startIndex,
          limit,
          sort,
          order,
          searchTerm: debouncedSearchTerm,
          roleFilter: activeTab
        }
      });
      setUsers(data.users || []);
      setTotalUsers(data.totalUsers || 0);
    } catch (err) {
      toast.error('Error fetching users');
      console.log('Error fetching admin users', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser._id, startIndex, limit, sort, order, debouncedSearchTerm, activeTab]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/api/admin/delete/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting user');
    }
  };

  const handlePageChange = (newStartIndex) => {
    setStartIndex(newStartIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalUsers / limit);
  const currentPage = Math.floor(startIndex / limit) + 1;

  return (
    <AnimatedPage>
      <div className='min-h-screen pt-28 pb-10 px-4 max-w-6xl mx-auto'>
        
        {/* Header Block */}
        <div className='flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 bg-white/50 backdrop-blur-sm p-8 rounded-3xl border border-white/40 shadow-xl'>
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <div className='bg-indigo-600/10 p-2 rounded-lg'>
                <FaUserShield className='text-indigo-600' />
              </div>
              <span className='text-xs font-black uppercase tracking-[0.2em] text-indigo-600'>Management Console</span>
            </div>
            <h1 className='text-4xl font-black text-slate-900 mb-2 tracking-tight'>Users Directory</h1>
            <p className='text-slate-500 font-light max-w-md'>
              Efficiently manage platform users, monitor their platform activity, and control access roles.
            </p>
          </div>
          
          <div className='flex flex-col gap-4 w-full md:w-auto'>
            <div className='relative flex-1 min-w-[280px]'>
              <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                <FaSearch className='text-slate-400' />
              </div>
              <input 
                type="text" 
                placeholder="Search user ID, name or email..." 
                className='w-full pl-12 pr-4 py-4 bg-white/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-sm shadow-sm'
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setStartIndex(0);
                }}
              />
            </div>

            <div className='flex items-center gap-2'>
              <div className='flex-1 flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm'>
                <FaSortAmountDown className='text-slate-400 text-xs' />
                <select 
                   className='bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 cursor-pointer w-full'
                   value={`${sort}_${order}`}
                   onChange={(e) => {
                     const [s, o] = e.target.value.split('_');
                     setSort(s);
                     setOrder(o);
                     setStartIndex(0);
                   }}
                >
                  <option value="activityScore_desc">Most Active First</option>
                  <option value="createdAt_desc">Newest First</option>
                  <option value="createdAt_asc">Oldest First</option>
                  <option value="username_asc">Username (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-6 gap-6 px-4">
          <button 
             onClick={() => { setActiveTab('client'); setStartIndex(0); }} 
             className={`pb-3 font-semibold text-sm transition-all relative ${activeTab === 'client' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
            Clients
            {activeTab === 'client' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-600"></span>}
          </button>
          <button 
             onClick={() => { setActiveTab('user'); setStartIndex(0); }} 
             className={`pb-3 font-semibold text-sm transition-all relative ${activeTab === 'user' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
            Sellers
            {activeTab === 'user' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-600"></span>}
          </button>
        </div>

        {/* User Stats Summary */}
        <div className='flex items-center justify-between mb-6 px-2'>
           <div className='flex items-center gap-4'>
              <span className='text-sm font-medium text-slate-500'>
                Showing <span className='text-slate-900 font-bold'>{totalUsers === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + limit, totalUsers)}</span> of <span className='text-indigo-600 font-bold'>{totalUsers}</span> users
              </span>
           </div>
           <Link to='/dashboard' className='text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest'>
             ← Root Dash
           </Link>
        </div>

        {/* User Grid */}
        <div className='min-h-[500px]'>
          
          {loading ? (
             <div className='flex flex-col items-center justify-center h-80 bg-white/30 rounded-3xl border border-white/50'>
                <div className='w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin'></div>
               <p className='mt-6 text-slate-400 font-medium animate-pulse'>Fetching User records...</p>
             </div>
          ) : users.length === 0 ? (
             <div className='flex flex-col items-center justify-center h-80 text-center bg-white/50 backdrop-blur-sm rounded-3xl border border-white/40 shadow-inner'>
                <div className='w-24 h-24 bg-slate-100/50 rounded-full flex items-center justify-center mb-6 border border-white'>
                  <FaUserShield className='text-slate-300 text-4xl' />
                </div>
                <h3 className='text-2xl font-black text-slate-800 mb-2'>No users found</h3>
                <p className='text-slate-500 text-sm max-w-xs'>
                  {searchTerm ? "No users matched your search criteria." : "There are currently no registered users on the platform."}
                </p>
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className='mt-6 text-indigo-600 font-bold text-xs uppercase tracking-widest hover:underline'>Clear Search</button>
                )}
             </div>
          ) : (
            <>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12'>
                {users.map((user, idx) => (
                  <div 
                    key={user._id} 
                    className='group bg-white rounded-[2rem] p-6 border border-slate-100 hover:border-indigo-400/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 relative overflow-hidden flex flex-col'
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50/50 to-transparent pointer-events-none' />

                    <div className='flex items-start justify-between mb-6 relative z-10'>
                      <div className='relative'>
                        <img 
                          src={user.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                          alt={user.username} 
                          className='w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500'
                        />
                        <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center text-white border-2 border-white shadow-lg ${
                           user.role === 'admin' ? 'bg-indigo-600' : 
                           user.role === 'user' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}>
                           <FaShieldAlt className='text-[10px]' />
                        </div>
                      </div>
                      
                      <div className='text-right'>
                        <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg ${
                          user.role === 'user' ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-200' :
                          user.role === 'client' ? 'bg-slate-100/80 text-slate-700 border border-slate-200' :
                          'bg-indigo-100/80 text-indigo-700 border border-indigo-200'
                        }`}>
                          {user.role === 'user' ? 'Seller' : user.role}
                        </span>
                        <div className='mt-3'>
                           <p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>Activity Score</p>
                           <p className='text-lg font-black text-indigo-600'>{user.activityScore || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className='flex-1'>
                      <h3 className='font-black text-slate-900 text-xl group-hover:text-indigo-600 transition-colors mb-1 truncate'>
                        {user.username}
                      </h3>
                      <div className='flex items-center gap-1.5 text-slate-500 mb-6'>
                        <FaEnvelope className='text-[10px] shrink-0' />
                        <p className='text-xs font-medium truncate'>{user.email}</p>
                      </div>
                    </div>

                    <div className='pt-6 border-t border-slate-50 flex items-center gap-3'>
                      <button className='flex-1 bg-slate-900 text-white font-bold text-[11px] py-3.5 rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/10 hover:shadow-indigo-600/20 active:scale-95 uppercase tracking-widest'>
                         View Details
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user._id)}
                        className='w-12 h-12 flex items-center justify-center bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all group/del active:scale-95 border border-red-100'
                      >
                         <FaTrash className='text-xs' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className='flex items-center justify-center gap-2 pb-10'>
                  <button 
                    onClick={() => handlePageChange(startIndex - limit)}
                    disabled={startIndex === 0}
                    className='w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm'
                  >
                    <FaChevronLeft className='text-xs' />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => handlePageChange(i * limit)}
                      className={`w-12 h-12 rounded-2xl font-black text-sm transition-all shadow-sm border ${
                        currentPage === i + 1 
                        ? 'bg-indigo-600 text-white border-indigo-600 scale-110 shadow-indigo-600/30' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200 hover:text-indigo-600'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button 
                    onClick={() => handlePageChange(startIndex + limit)}
                    disabled={startIndex + limit >= totalUsers}
                    className='w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm'
                  >
                    <FaChevronRight className='text-xs' />
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </AnimatedPage>
  );
}
