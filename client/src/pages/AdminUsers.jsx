import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import AnimatedPage from '../components/AnimatedPage';
import { FaUserShield, FaSearch, FaEnvelope, FaShieldAlt } from 'react-icons/fa';

export default function AdminUsers() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Protective routing just in case
  if (!currentUser || currentUser.role !== 'admin') {
     return <Navigate to='/error/401' />;
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`/api/admin/users/${currentUser._id}`);
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log('Error fetching admin users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentUser._id]);

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatedPage>
      <div className='min-h-screen pt-28 pb-10 px-4 max-w-6xl mx-auto'>
        
        {/* Header Block */}
        <div className='flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6'>
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <FaUserShield className='text-indigo-600' />
              <span className='text-xs font-bold uppercase tracking-wider text-indigo-600'>Administration</span>
            </div>
            <h1 className='text-3xl font-extrabold text-slate-900 mb-2'>User Directory</h1>
            <p className='text-slate-500 font-light max-w-xl'>
              Manage your assigned team members, monitor their roles, and track platform access directly.
            </p>
          </div>
          
          <div className='flex items-center gap-4 w-full md:w-auto'>
            <div className='relative flex-1 min-w-[250px]'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <FaSearch className='text-slate-400' />
              </div>
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                className='w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link to='/dashboard' className='hidden md:flex items-center justify-center bg-slate-900 text-white px-5 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors text-sm shadow-sm shrink-0'>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* User Grid */}
        <div className='bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm min-h-[500px]'>
          
          {loading ? (
             <div className='flex items-center justify-center h-64'>
               <div className='w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin'></div>
             </div>
          ) : filteredUsers.length === 0 ? (
             <div className='flex flex-col items-center justify-center h-64 text-center'>
                <div className='w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100'>
                  <FaUserShield className='text-slate-300 text-3xl' />
                </div>
                <h3 className='text-lg font-bold text-slate-800 mb-1'>No users found</h3>
                <p className='text-slate-500 text-sm'>
                  {searchTerm ? "No team members matched your search query." : "You currently don't have any users assigned to your management."}
                </p>
             </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredUsers.map(user => (
                <div key={user._id} className='bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all duration-300 group'>
                  <div className='flex items-start justify-between mb-4'>
                    <img 
                      src={user.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                      alt={user.username} 
                      className='w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm'
                    />
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full ${
                      user.role === 'user' ? 'bg-emerald-100 text-emerald-700' :
                      user.role === 'client' ? 'bg-slate-200 text-slate-700' :
                      'bg-indigo-100 text-indigo-700'
                    }`}>
                      {user.role === 'user' ? 'Seller' : user.role}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className='font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors truncate mb-1'>
                      {user.username}
                    </h3>
                    <div className='flex items-center gap-1.5 text-slate-500 mb-4'>
                      <FaEnvelope className='text-[10px] shrink-0' />
                      <p className='text-xs truncate'>{user.email}</p>
                    </div>
                  </div>

                  <div className='pt-4 border-t border-slate-200/60 mt-auto'>
                    <button className='w-full bg-white border border-slate-200 text-slate-700 font-semibold text-xs py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors flex items-center justify-center gap-2'>
                       <FaShieldAlt className='text-[10px]' /> Quick Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </AnimatedPage>
  );
}
