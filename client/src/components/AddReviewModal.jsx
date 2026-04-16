import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaUser, FaSearch } from 'react-icons/fa';

export default function AddReviewModal({ isOpen, onClose, onReviewAdded, reviewToEdit }) {
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    authorName: '',
    authorAvatar: '',
    rating: 5,
    content: '',
    profession: ''
  });
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUserList, setShowUserList] = useState(false);

  useEffect(() => {
    if (reviewToEdit) {
      setFormData({
        authorName: reviewToEdit.authorName || '',
        authorAvatar: reviewToEdit.authorAvatar || '',
        rating: reviewToEdit.rating || 5,
        content: reviewToEdit.content || '',
        profession: reviewToEdit.profession || ''
      });
    } else {
      setFormData({
        authorName: '',
        authorAvatar: '',
        rating: 5,
        content: '',
        profession: ''
      });
    }
  }, [reviewToEdit, isOpen]);

  useEffect(() => {
    if (isOpen && currentUser) {
      const fetchUsers = async () => {
        try {
          setLoadingUsers(true);
          const { data } = await axios.get(`/api/admin/users/${currentUser._id}`, {
            params: { limit: 1000 }
          });
          setUsers(data.users || []);
        } catch (err) {
          console.log('Failed to fetch users');
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [isOpen, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (reviewToEdit) {
        const { data } = await axios.put(`/api/review/update/${reviewToEdit._id}`, formData);
        toast.success('Review updated successfully!');
        onReviewAdded(data);
      } else {
        const { data } = await axios.post('/api/review/create', formData);
        toast.success('Review added successfully!');
        onReviewAdded(data);
      }
      onClose();
    } catch (error) {
      toast.error(reviewToEdit ? 'Failed to update review' : 'Failed to add review');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    setFormData({
      ...formData,
      authorName: user.username,
      authorAvatar: user.avatar,
      profession: user.role === 'user' ? 'Seller' : 'Client'
    });
    setShowUserList(false);
    setUserSearchTerm('');
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar'>
        <h2 className='text-2xl font-bold mb-6 text-slate-800'>{reviewToEdit ? 'Edit Testimonial' : 'Add User Testimonial'}</h2>
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
          
          {/* User Selection Section */}
          <div className='relative'>
            <label className='text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider'>Select Platform User</label>
            <div className='flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500 transition-all'>
              <FaSearch className='text-slate-400 text-sm' />
              <input 
                type='text'
                placeholder='Search by name or email...'
                value={userSearchTerm}
                onChange={(e) => {
                  setUserSearchTerm(e.target.value);
                  setShowUserList(true);
                }}
                onFocus={() => setShowUserList(true)}
                className='bg-transparent text-sm w-full outline-none'
              />
            </div>
            
            {showUserList && userSearchTerm && (
              <div className='absolute z-10 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar overflow-x-hidden'>
                {loadingUsers ? (
                  <div className='p-4 text-center'><div className='w-4 h-4 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto'></div></div>
                ) : filteredUsers.length === 0 ? (
                  <p className='p-4 text-xs text-slate-400 text-center'>No users found</p>
                ) : (
                  filteredUsers.map(user => (
                    <div 
                      key={user._id} 
                      onClick={() => handleSelectUser(user)}
                      className='flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-none'
                    >
                      <img src={user.avatar} alt='' className='w-8 h-8 rounded-full object-cover border border-slate-100' />
                      <div className='min-w-0'>
                        <p className='text-xs font-bold text-slate-800 truncate'>{user.username}</p>
                        <p className='text-[10px] text-slate-400 truncate'>{user.email}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider'>Selected Name</label>
              <input 
                type='text' 
                required 
                value={formData.authorName}
                onChange={(e) => setFormData({...formData, authorName: e.target.value})}
                className='w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all'
                placeholder='Select or type...'
              />
            </div>
            <div>
              <label className='text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider'>Profession</label>
              <input 
                type='text' 
                value={formData.profession}
                onChange={(e) => setFormData({...formData, profession: e.target.value})}
                className='w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all'
                placeholder='e.g. Graphic Designer'
              />
            </div>
          </div>

          <div className='flex items-center gap-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl'>
            {formData.authorAvatar ? (
              <img src={formData.authorAvatar} alt='' className='w-12 h-12 rounded-full object-cover border-2 border-white' />
            ) : (
              <div className='w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300'>
                <FaUser size={20} />
              </div>
            )}
            <div className='flex-1'>
               <p className='text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1'>Selected Avatar</p>
               <p className='text-[11px] text-slate-500 truncate'>{formData.authorAvatar || 'No avatar selected'}</p>
            </div>
          </div>

          <div>
            <label className='text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider'>Rating (1-5)</label>
            <input 
              type='number' 
              min='1' 
              max='5'
              required 
              value={formData.rating}
              onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
              className='w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all'
            />
          </div>

          <div>
            <label className='text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider'>Review Content</label>
            <textarea 
              required 
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className='w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px] resize-none'
              placeholder='Tell us what they said...'
            ></textarea>
          </div>

          <div className='flex gap-3 mt-2'>
            <button 
              type='button' 
              onClick={onClose}
              className='flex-1 py-3.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors'
            >
              Cancel
            </button>
            <button 
              type='submit' 
              disabled={loading}
              className='flex-1 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30'
            >
              {loading ? (reviewToEdit ? 'Updating...' : 'Posting...') : (reviewToEdit ? 'Update Review' : 'Post Review')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
