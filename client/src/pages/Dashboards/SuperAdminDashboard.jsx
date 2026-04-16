import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import AnimatedPage from '../../components/AnimatedPage';
import {
  FaUsers, FaCrown, FaArrowUp, FaCheck, FaTimes, FaChevronRight,
  FaClipboardList, FaUserShield, FaDoorOpen, FaEnvelope, FaSearch
} from 'react-icons/fa';

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

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data } = await axios.get(`/api/admin/users/${currentUser._id}`, {
          params: { limit: 1000 } // SuperAdmin might want a larger list or I should add pagination here too, but for now let's just fix the fetch.
        });
        setAllUsers(data.users || []);
      } catch (err) { console.log('Could not fetch users'); }
      finally { setLoadingUsers(false); }
    };

    const fetchListings = async () => {
      try {
        const { data } = await axios.get('/api/listing/get?limit=100');
        setAllListings(Array.isArray(data) ? data : []);
      } catch (err) { console.log('Could not fetch listings'); }
      finally { setLoadingListings(false); }
    };

    const fetchRequests = async () => {
      try {
        const { data } = await axios.get('/api/upgrade/pending');
        setUpgradeRequests(Array.isArray(data) ? data : []);
      } catch (err) { console.log('Could not fetch requests'); }
      finally { setLoadingRequests(false); }
    };

    fetchAll();
    fetchListings();
    fetchRequests();
  }, [currentUser._id]);

  const handleApprove = async (id) => {
    try {
      await axios.post(`/api/upgrade/approve/${id}`);
      setUpgradeRequests(prev => prev.filter(r => r._id !== id));
      toast.success('Upgrade approved!');
    } catch (err) { toast.error('Failed.'); }
  };

  const handleDeny = async (id) => {
    try {
      await axios.post(`/api/upgrade/deny/${id}`);
      setUpgradeRequests(prev => prev.filter(r => r._id !== id));
      toast.success('Request denied.');
    } catch (err) { toast.error('Failed.'); }
  };

  const roleCount = (role) => allUsers.filter(u => u.role === role).length;
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
          <Link
            to='/profile'
            className='text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 self-start sm:self-auto'
          >
            Settings <FaChevronRight className='text-[10px]' />
          </Link>
        </div>

        {/* Stats Row */}
        <div className='grid grid-cols-2 md:grid-cols-5 gap-3 mb-8'>
          <div className='bg-white border border-slate-100 rounded-2xl p-4'>
            <div className='flex items-center justify-between mb-2'>
              <div className='w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center'>
                <FaUsers className='text-white text-xs' />
              </div>
              <span className='text-xl font-extrabold text-slate-900'>{allUsers.length}</span>
            </div>
            <p className='text-[11px] text-slate-400 font-medium'>All Users</p>
          </div>
          <div className='bg-white border border-slate-100 rounded-2xl p-4'>
            <div className='flex items-center justify-between mb-2'>
              <div className='w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center'>
                <FaUserShield className='text-white text-xs' />
              </div>
              <span className='text-xl font-extrabold text-slate-900'>{roleCount('admin')}</span>
            </div>
            <p className='text-[11px] text-slate-400 font-medium'>Admins</p>
          </div>
          <div className='bg-white border border-slate-100 rounded-2xl p-4'>
            <div className='flex items-center justify-between mb-2'>
              <div className='w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center'>
                <FaClipboardList className='text-white text-xs' />
              </div>
              <span className='text-xl font-extrabold text-slate-900'>{roleCount('user')}</span>
            </div>
            <p className='text-[11px] text-slate-400 font-medium'>Sellers</p>
          </div>
          <div className='bg-white border border-slate-100 rounded-2xl p-4'>
            <div className='flex items-center justify-between mb-2'>
              <div className='w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center'>
                <FaDoorOpen className='text-white text-xs' />
              </div>
              <span className='text-xl font-extrabold text-slate-900'>{allListings.length}</span>
            </div>
            <p className='text-[11px] text-slate-400 font-medium'>Listings</p>
          </div>
          <div className='bg-white border border-slate-100 rounded-2xl p-4 col-span-2 md:col-span-1'>
            <div className='flex items-center justify-between mb-2'>
              <div className='w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center'>
                <FaArrowUp className='text-white text-xs' />
              </div>
              <span className='text-xl font-extrabold text-slate-900'>{upgradeRequests.length}</span>
            </div>
            <p className='text-[11px] text-slate-400 font-medium'>Pending Upgrades</p>
          </div>
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
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 ${
                      user.role === 'superadmin' ? 'bg-amber-100 text-amber-700' :
                      user.role === 'admin' ? 'bg-indigo-50 text-indigo-600' :
                      user.role === 'user' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {user.role === 'user' ? 'seller' : user.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className='flex flex-col gap-5'>

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
        </div>
      </div>
    </AnimatedPage>
  );
}
