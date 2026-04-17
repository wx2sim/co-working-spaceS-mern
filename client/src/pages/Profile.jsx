import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  updateUserStart, updateUserSuccess, updateUserFailure,
  deleteUserFailure, deleteUserStart, deleteUserSuccess,
  signOutUserStart, signOutUserFailure, signOutUserSuccess
} from '../redux/user/userSlice.js';
import axios from 'axios';
import toast from 'react-hot-toast';
import SmartButton from '../components/SmartButton.jsx';
import SmartModal from '../components/SmartModal.jsx';
import { Modal } from 'antd';
import { FaEnvelope, FaArrowUp, FaCheck, FaTimes, FaClock } from 'react-icons/fa';

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);

  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [bookedSpaces, setBookedSpaces] = useState([]);
  const [showBookedSpacesError, setShowBookedSpacesError] = useState(false);
  const [bookedSpacesFetched, setBookedSpacesFetched] = useState(false);

  const [adminUsers, setAdminUsers] = useState([]);
  const [showAdminUsersError, setShowAdminUsersError] = useState(false);
  const [adminUsersFetched, setAdminUsersFetched] = useState(false);

  // Upgrade request state
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeStatus, setUpgradeStatus] = useState('none'); // none, pending, approved, denied
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeForm, setUpgradeForm] = useState({ fullName: '', businessName: '', speciality: '', phoneNumber: '' });
  const [upgradeRequests, setUpgradeRequests] = useState([]);
  const [upgradeRequestsFetched, setUpgradeRequestsFetched] = useState(false);

  const [contactMessage, setContactMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  // Check upgrade status on mount for clients
  useEffect(() => {
    if (currentUser?.role === 'client') {
      const checkUpgradeStatus = async () => {
        try {
          const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/upgrade/my-status`);
          setUpgradeStatus(data.status);
        } catch (err) {
          console.log('Could not check upgrade status');
        }
      };
      checkUpgradeStatus();
    }
  }, [currentUser]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/user/update/${currentUser._id}`, formData);
      if (data.success === false) {
        toast.error(data.message, { duration: 3000 });
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      toast.success('Profile updated successfully!', { duration: 3000 });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message, { duration: 3000 });
      dispatch(updateUserFailure(message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const { data } = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/user/delete/${currentUser._id}`);
      if (data.success === false) {
        toast.error(data.message, { duration: 3000 });
        dispatch(deleteUserFailure(data));
        return;
      }
      dispatch(deleteUserSuccess(data));
      toast.success('Account deleted successfully!', { duration: 3000 });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message, { duration: 3000 });
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/signout`);
      if (data.success === false) {
        toast.error(data.message, { duration: 3000 });
        dispatch(signOutUserFailure(data));
        return;
      }
      dispatch(signOutUserSuccess(data));
      toast.success('Signed out successfully!', { duration: 3000 });
      navigate('/signin');
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message, { duration: 3000 });
      dispatch(signOutUserFailure(error.message));
    }
  };

  const handleShowBookedSpaces = async () => {
    if (bookedSpacesFetched) {
      setBookedSpaces([]);
      setBookedSpacesFetched(false);
      return;
    }
    try {
      setShowBookedSpacesError(false);
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/booking/client`);
      setBookedSpaces(data);
      setBookedSpacesFetched(true);
    } catch (error) {
      setShowBookedSpacesError(true);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const { data } = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/booking/cancel/${bookingId}`);
      toast.success('Reservation cancelled successfully');
      setBookedSpaces((prev) => prev.filter((b) => b._id !== bookingId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleShowAdminUsers = async () => {
    if (adminUsersFetched) {
      setAdminUsers([]);
      setAdminUsersFetched(false);
      return;
    }
    try {
      setShowAdminUsersError(false);
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${currentUser._id}`);
      if (data.success === false) return setShowAdminUsersError(true);
      setAdminUsers(data);
      setAdminUsersFetched(true);
    } catch (error) {
      setShowAdminUsersError(true);
    }
  };

  // Upgrade request handlers
  const handleUpgradeFormChange = (e) => {
    setUpgradeForm({ ...upgradeForm, [e.target.id]: e.target.value });
  };

  const handleUpgradeSubmit = async () => {
    if (!upgradeForm.fullName || !upgradeForm.businessName || !upgradeForm.speciality || !upgradeForm.phoneNumber) {
      return toast.error('Please fill in all fields.');
    }
    try {
      setUpgradeLoading(true);
      const payload = {
        ...upgradeForm,
        phoneNumber: '+213' + upgradeForm.phoneNumber.replace(/^\+?213/, ''),
      };
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/upgrade/request`, payload);
      setUpgradeStatus('pending');
      setIsUpgradeModalOpen(false);
      toast.success('Upgrade request sent successfully!');
      setUpgradeForm({ fullName: '', businessName: '', speciality: '', phoneNumber: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send request.';
      toast.error(msg);
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleShowUpgradeRequests = async () => {
    if (upgradeRequestsFetched) {
      setUpgradeRequests([]);
      setUpgradeRequestsFetched(false);
      return;
    }
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/upgrade/pending`);
      setUpgradeRequests(data);
      setUpgradeRequestsFetched(true);
    } catch (err) {
      toast.error('Failed to fetch upgrade requests.');
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/upgrade/approve/${requestId}`);
      setUpgradeRequests((prev) => prev.filter((r) => r._id !== requestId));
      toast.success('Request approved! User upgraded to seller.');
    } catch (err) {
      toast.error('Failed to approve request.');
    }
  };

  const handleDenyRequest = async (requestId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/upgrade/deny/${requestId}`);
      setUpgradeRequests((prev) => prev.filter((r) => r._id !== requestId));
      toast.success('Request denied.');
    } catch (err) {
      toast.error('Failed to deny request.');
    }
  };

  const handleContactAdmin = async (e) => {
    e.preventDefault();
    if (!contactMessage.trim()) return toast.error('Please enter a message');
    setSendingMessage(true);
    try {
      const { data: adminData } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/support-admin`);
      if (!adminData || !adminData._id) throw new Error('No admin found');

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/message/send`, {
        receiverId: adminData._id,
        content: contactMessage
      });

      toast.success('Message sent to SuperAdmin successfully!');
      setContactMessage('');
      navigate('/schedule'); // Redirect to inbox to see the thread
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message to SuperAdmin');
    } finally {
      setSendingMessage(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className='min-h-screen pt-28 pb-10 px-4 max-w-6xl mx-auto'>
      <div className='bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[400px]'>

        <div className='w-full md:w-5/12 p-8 sm:p-10 flex flex-col'>
          <h1 className='text-3xl font-extrabold text-slate-900 mb-2'>
            {currentUser.role === 'admin' ? 'Account Details' : 'Profile Setup'}
          </h1>

          {currentUser.role === 'admin' ? (
            <div className='flex flex-col gap-5 flex-grow mt-4'>
              <div className='flex flex-col items-center mb-6'>
                <img
                  src={currentUser?.avatar}
                  alt='profile'
                  className='rounded-full h-24 w-24 object-cover border-4 border-slate-50 shadow-sm'
                />
                <span className='mt-3 text-xs font-bold px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full uppercase tracking-wider'>
                  Administrator
                </span>
              </div>

              <div className='flex flex-col gap-1'>
                <label className='text-xs font-medium text-slate-500 ml-1'>Username</label>
                <input type='text' disabled value={currentUser.username} className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 cursor-not-allowed' />
              </div>

              <div className='flex flex-col gap-1'>
                <label className='text-xs font-medium text-slate-500 ml-1'>Email</label>
                <input type='email' disabled value={currentUser.email} className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 cursor-not-allowed' />
              </div>

              <div className='mt-auto p-4 bg-amber-50 border border-amber-100 rounded-xl text-center'>
                <p className='text-xs text-amber-700 font-medium'>
                  Your account details and password are strictly managed by the Super Admin.
                </p>
              </div>

              <div className='mt-2 pt-4 border-t border-slate-100'>
                <h3 className='text-sm font-bold text-slate-900 mb-3 flex items-center gap-2'>
                  <FaEnvelope className='text-indigo-600' />
                  Contact SuperAdmin Support
                </h3>
                <form onSubmit={handleContactAdmin} className='flex flex-col gap-2'>
                  <textarea
                    className='w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none h-20'
                    placeholder='Inquire about an issue or request support...'
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                  />
                  <button
                    type='submit'
                    disabled={sendingMessage}
                    className='w-full bg-slate-900 text-white font-medium py-2 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-70 text-xs mt-1'
                  >
                    {sendingMessage ? 'Sending...' : 'Send Message to SuperAdmin'}
                  </button>
                </form>
              </div>

              <Link to='/schedule' className='mt-2 flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm'>
                <FaEnvelope /> Direct Messages Inbox
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='flex flex-col gap-5 flex-grow mt-4'>
              <div className='flex flex-col items-center mb-4'>
                <input onChange={(e) => setFile(e.target.files[0])} type='file' ref={fileRef} hidden accept='image/*' />
                <div onClick={() => fileRef.current.click()} className='relative group cursor-pointer'>
                  <img src={formData.avatar || currentUser?.avatar} alt='profile' className='rounded-full h-24 w-24 object-cover border-4 border-slate-50 group-hover:opacity-80 transition-opacity shadow-sm' />
                  <div className='absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                    <span className='text-white text-xs font-semibold'>Edit</span>
                  </div>
                </div>
                <p className='text-xs mt-3 text-center'>
                  {fileUploadError ? <span className='text-red-500 font-medium'>Upload failed (Max 2MB)</span> : filePerc > 0 && filePerc < 100 ? <span className='text-slate-500'>Uploading {filePerc}%</span> : filePerc === 100 ? <span className='text-green-500 font-medium'>Upload complete!</span> : <span className='text-slate-400'>Click image to change</span>}
                </p>
              </div>

              <input type='text' placeholder='Username' id='username' defaultValue={currentUser.username} onChange={handleChange} className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all text-sm' />
              <input type='email' placeholder='Email' id='email' defaultValue={currentUser.email} onChange={handleChange} className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all text-sm' />
              <input type='password' placeholder='New Password (Optional)' id='password' onChange={handleChange} className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all text-sm' />

              <div className='pt-2 flex flex-col gap-3'>
                <button disabled={loading} className='w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-70 text-sm'>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          <div className={`flex items-center mt-6 pt-4 border-t border-slate-100 ${currentUser.role === 'admin' ? 'justify-end' : 'justify-between'}`}>
            {currentUser.role !== 'admin' && (
              <SmartModal
                triggerText="Delete Account" triggerColorClass="!bg-transparent !text-red-500 hover:!bg-red-50 !font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                modalTitle="Delete Account" modalContent="Are you absolutely sure? This action cannot be undone."
                cancelColorClass="!bg-white text-slate-700 hover:!bg-slate-100" okText="Yes, Delete" okColorClass="bg-red-600 !text-white hover:!bg-red-700" onOkAction={handleDeleteUser}
              />
            )}
            <button onClick={handleSignOut} className='text-slate-500 hover:text-slate-800 font-semibold text-sm px-4 py-2 transition-colors'>
              Sign Out
            </button>
          </div>

        </div>

        <div className='hidden md:block w-px bg-slate-100 my-10'></div>

        <div className='w-full md:w-7/12 p-8 sm:p-10 bg-slate-50/50 flex flex-col'>

          {currentUser.role === 'admin' ? (
            <>
              {/* Tab Headers for Admin */}
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
                <div>
                  <h2 className='text-2xl font-bold text-slate-900'>My Team</h2>
                  <p className='text-sm text-slate-500'>Manage your assigned users</p>
                </div>

                <div className='flex items-center gap-3'>
                  <SmartButton
                    actionFunction={handleShowUpgradeRequests}
                    colorClass="!bg-gradient-to-r !from-indigo-600 !to-violet-600 !text-white hover:!from-indigo-700 hover:!to-violet-700 !px-5 !py-2 !rounded-full shadow-sm text-sm font-medium transition-all"
                    text={upgradeRequestsFetched ? 'Hide Requests' : 'Upgrade Requests'}
                    showAlert={false}
                  />
                  <SmartButton
                    actionFunction={handleShowAdminUsers}
                    colorClass="!bg-white !text-slate-700 border border-slate-200 hover:!bg-slate-100 !px-5 !py-2 !rounded-full shadow-sm text-sm font-medium transition-all"
                    text={adminUsersFetched ? "Hide Users" : "Show Users"}
                    showAlert={false}
                  />
                </div>
              </div>

              <div className='flex-grow overflow-y-auto pr-2 custom-scrollbar'>
                {/* Upgrade Requests Section */}
                {upgradeRequestsFetched && (
                  <div className='mb-6'>
                    <h3 className='text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2'>
                      <FaArrowUp className='text-indigo-600 text-xs' />
                      Pending Upgrade Requests
                    </h3>
                    {upgradeRequests.length === 0 ? (
                      <div className='bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center'>
                        <p className='text-sm text-slate-500'>No pending upgrade requests.</p>
                      </div>
                    ) : (
                      <div className='flex flex-col gap-3'>
                        {upgradeRequests.map((req) => (
                          <div key={req._id} className='bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-shadow'>
                            <div className='flex items-start justify-between gap-3'>
                              <div className='flex items-center gap-3'>
                                <img src={req.userId?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} alt='user' className='w-10 h-10 rounded-full object-cover border border-slate-200' />
                                <div>
                                  <p className='font-semibold text-slate-800 text-sm'>{req.fullName}</p>
                                  <p className='text-xs text-slate-500'>{req.userId?.email}</p>
                                </div>
                              </div>
                              <span className='text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-full uppercase tracking-wider'>Pending</span>
                            </div>
                            <div className='mt-3 grid grid-cols-2 gap-2 text-xs'>
                              <div className='bg-slate-50 rounded-lg px-3 py-2'>
                                <span className='text-slate-400'>Business</span>
                                <p className='font-semibold text-slate-700'>{req.businessName}</p>
                              </div>
                              <div className='bg-slate-50 rounded-lg px-3 py-2'>
                                <span className='text-slate-400'>Speciality</span>
                                <p className='font-semibold text-slate-700'>{req.speciality}</p>
                              </div>
                              <div className='bg-slate-50 rounded-lg px-3 py-2 col-span-2'>
                                <span className='text-slate-400'>Phone</span>
                                <p className='font-semibold text-slate-700'>{req.phoneNumber}</p>
                              </div>
                            </div>
                            <div className='flex gap-2 mt-3'>
                              <button
                                onClick={() => handleApproveRequest(req._id)}
                                className='flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 text-white text-xs font-medium py-2 rounded-lg hover:bg-emerald-700 transition-colors'
                              >
                                <FaCheck className='text-[10px]' /> Approve
                              </button>
                              <button
                                onClick={() => handleDenyRequest(req._id)}
                                className='flex-1 flex items-center justify-center gap-1.5 bg-white text-red-600 border border-red-200 text-xs font-medium py-2 rounded-lg hover:bg-red-50 transition-colors'
                              >
                                <FaTimes className='text-[10px]' /> Deny
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {showAdminUsersError && <p className='text-red-500 text-sm p-4 bg-red-50 rounded-xl text-center'>Error fetching users!</p>}

                {adminUsersFetched && adminUsers.length === 0 && !showAdminUsersError && (
                  <div className='flex flex-col items-center justify-center h-full text-center opacity-70 py-10'>
                    <img src="https://cdn-icons-png.flaticon.com/512/6124/6124997.png" alt="No users" className="w-24 h-24 mb-4 opacity-30 grayscale" />
                    <p className='text-lg font-semibold text-slate-700'>No users assigned</p>
                    <p className='text-sm text-slate-500'>You currently don't have any users to manage.</p>
                  </div>
                )}

                {adminUsers && adminUsers.length > 0 && (
                  <div className='flex flex-col gap-4'>
                    {adminUsers.map((user) => (
                      <div key={user._id} className='bg-white border border-slate-100 rounded-2xl p-4 flex justify-between items-center gap-4 hover:shadow-md transition-shadow'>
                        <div className='flex items-center gap-4'>
                          <img src={user.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} alt='user' className='w-12 h-12 rounded-full object-cover border border-slate-200' />
                          <div>
                            <p className='font-semibold text-slate-800'>{user.username}</p>
                            <p className='text-xs text-slate-500'>{user.email}</p>
                          </div>
                        </div>
                        <button className='text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium text-sm transition-colors'>
                          Manage
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {!adminUsersFetched && !upgradeRequestsFetched && (
                  <div className='flex items-center justify-center h-full text-center opacity-50 py-10'>
                    <p className='text-sm text-slate-500'>Click "Show Users" to view your team members.</p>
                  </div>
                )}
              </div>
            </>
          ) : currentUser.role === 'client' ? (
            <>
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
                <div>
                  <h2 className='text-2xl font-bold text-slate-900'>My Booked Spaces</h2>
                  <p className='text-sm text-slate-500'>Check your reserved workspaces</p>
                </div>

                <div className='flex items-center gap-3'>
                  <SmartButton
                    actionFunction={handleShowBookedSpaces}
                    colorClass="!bg-white !text-slate-700 border border-slate-200 hover:!bg-slate-100 !px-5 !py-2 !rounded-full shadow-sm text-sm font-medium transition-all"
                    text={bookedSpacesFetched ? "Hide Bookings" : "Check Bookings"}
                    showAlert={false}
                  />
                </div>
              </div>

              <div className='flex-grow overflow-y-auto pr-2 custom-scrollbar'>
                {showBookedSpacesError && <p className='text-red-500 text-sm p-4 bg-red-50 rounded-xl text-center'>Error fetching booked spaces!</p>}

                {bookedSpacesFetched && bookedSpaces.length === 0 && !showBookedSpacesError && (
                  <div className='flex flex-col items-center justify-center h-full text-center opacity-70 py-10'>
                    <img src="/images/empty-calendar.svg" alt="No booked spaces" className="w-32 h-32 mb-4 opacity-50" onError={(e) => e.target.style.display = 'none'} />
                    <p className='text-lg font-semibold text-slate-700'>No spaces booked yet</p>
                    <p className='text-sm text-slate-500 mb-4'>You haven't reserved any workspaces.</p>
                    <Link to='/search' className='text-slate-900 font-semibold hover:underline text-sm'>
                      Explore Workspaces
                    </Link>
                  </div>
                )}

                {bookedSpaces && bookedSpaces.length > 0 && (
                  <div className='flex flex-col gap-4'>
                    {bookedSpaces.map((space) => (
                      <div key={space._id} className='bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow relative overflow-hidden'>
                        {/* Status bar atop card */}
                        <div className={`absolute top-0 left-0 w-full h-1 ${space.status === 'approved' ? 'bg-emerald-500' : space.status === 'rejected' ? 'bg-red-500' : 'bg-amber-400'}`}></div>

                        <div className='flex justify-between items-start'>
                          <div className="flex gap-4">
                            <img src={space.listing?.imageUrls?.[0] || 'https://via.placeholder.com/150'} className="w-16 h-16 rounded-xl object-cover bg-slate-100" />
                            <div>
                              <Link to={`/listing/${space.listing?._id}`} className='font-bold text-slate-800 hover:text-indigo-600 truncate'>{space.listing?.name || 'Workspace'}</Link>
                              <p className='text-xs text-slate-500 mb-1'>{space.listing?.address}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${space.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : space.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                {space.status === 'pending' ? 'Waiting to be confirmed' : space.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className='text-sm text-slate-400'>Total Price</p>
                            <p className='text-lg font-extrabold text-slate-900'>{space.finalPrice} DA</p>
                          </div>
                        </div>

                        {(space.features && space.features.length > 0) && (
                          <div className='pt-3 border-t border-slate-50'>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1.5">Activated Features</p>
                            <div className="flex flex-wrap gap-1.5">
                              {space.features.map(f => (
                                <span key={f} className="text-xs bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-md">{f}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className='flex items-center justify-between mt-auto'>
                          <p className='text-[10px] text-slate-400'>
                            {new Date(space.createdAt).toLocaleDateString()}
                          </p>
                          
                          <SmartModal
                            triggerText="Cancel"
                            triggerColorClass="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors"
                            modalTitle="Cancel Reservation"
                            modalContent="Are you sure you want to cancel this booking? This will remove your reservation."
                            okText="Yes, Cancel"
                            okColorClass="bg-red-600 !text-white hover:!bg-red-700"
                            onOkAction={() => handleCancelBooking(space._id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!bookedSpacesFetched && (
                  <div className='flex items-center justify-center h-full text-center opacity-50 py-10'>
                    <p className='text-sm text-slate-500'>Click "Check Bookings" to view your reserved spaces.</p>
                  </div>
                )}
              </div>

              {/* Upgrade to Seller Section */}
              <div className='mt-6 pt-5 border-t border-slate-100'>
                {upgradeStatus === 'none' || upgradeStatus === 'denied' ? (
                  <button
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className='w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium py-3 rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 text-sm shadow-sm'
                  >
                    <FaArrowUp className='text-xs' />
                    {upgradeStatus === 'denied' ? 'Re-apply to Become a Seller' : 'Upgrade to Seller'}
                  </button>
                ) : upgradeStatus === 'pending' ? (
                  <div className='w-full flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 font-medium py-3 rounded-xl text-sm cursor-default'>
                    <FaClock className='text-xs' />
                    Upgrade Request Pending
                  </div>
                ) : null}
              </div>

              {/* Upgrade Request Modal */}
              <Modal
                title={<span className='text-lg font-bold text-slate-900'>Upgrade to Seller</span>}
                open={isUpgradeModalOpen}
                onCancel={() => setIsUpgradeModalOpen(false)}
                footer={null}
                centered
                destroyOnClose
              >
                <p className='text-sm text-slate-500 mb-5'>Fill in your business details to request a seller account.</p>
                <div className='flex flex-col gap-3'>
                  <div className='flex flex-col gap-1'>
                    <label className='text-xs font-medium text-slate-500 ml-1'>Full Name</label>
                    <input
                      type='text'
                      id='fullName'
                      placeholder='Your full name'
                      value={upgradeForm.fullName}
                      onChange={handleUpgradeFormChange}
                      className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all text-sm'
                    />
                  </div>
                  <div className='flex flex-col gap-1'>
                    <label className='text-xs font-medium text-slate-500 ml-1'>Business Name</label>
                    <input
                      type='text'
                      id='businessName'
                      placeholder='Your company or business name'
                      value={upgradeForm.businessName}
                      onChange={handleUpgradeFormChange}
                      className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all text-sm'
                    />
                  </div>
                  <div className='flex flex-col gap-1'>
                    <label className='text-xs font-medium text-slate-500 ml-1'>Speciality</label>
                    <input
                      type='text'
                      id='speciality'
                      placeholder='e.g. Co-working, Event Space, etc.'
                      value={upgradeForm.speciality}
                      onChange={handleUpgradeFormChange}
                      className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all text-sm'
                    />
                  </div>
                  <div className='flex flex-col gap-1'>
                    <label className='text-xs font-medium text-slate-500 ml-1'>Phone Number</label>
                    <div className='flex items-center gap-2'>
                      <span className='bg-slate-100 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-600 font-medium whitespace-nowrap'>+213</span>
                      <input
                        type='tel'
                        id='phoneNumber'
                        placeholder='5XX XXX XXX'
                        value={upgradeForm.phoneNumber}
                        onChange={handleUpgradeFormChange}
                        className='flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all text-sm'
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleUpgradeSubmit}
                    disabled={upgradeLoading}
                    className='w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-all duration-300 disabled:opacity-70 text-sm mt-2'
                  >
                    {upgradeLoading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </Modal>
            </>
          ) : (
            <div className='flex flex-col items-center justify-center text-center h-full opacity-70'>
              <img src="https://cdn-icons-png.flaticon.com/512/9908/9908191.png" alt="Dashboard" className="w-24 h-24 mb-6 opacity-40 grayscale" onError={(e) => e.target.style.display = 'none'} />
              <h2 className='text-3xl font-bold text-slate-800 mb-2'>Workspace Management Moved</h2>
              <p className='text-sm text-slate-500 mb-8 max-w-sm mx-auto'>
                All your listings, creation tools, and workspace management are now centralized in your dedicated Seller Dashboard.
              </p>
              <Link to='/dashboard' className='bg-indigo-600 text-white px-8 py-3.5 rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow-md inline-flex items-center gap-2 tracking-wide'>
                Go to Dashboard
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}