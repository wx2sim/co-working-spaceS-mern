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
import CreateListingModal from '../components/CreateListingModal.jsx';
import UpdateListingModal from '../components/UpdateListingModal.jsx';

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [showListingsError, setShowListingsError] = useState(false);
  const [listingsFetched, setListingsFetched] = useState(false); 

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [listingToEdit, setListingToEdit] = useState(null);

  const [bookedSpaces, setBookedSpaces] = useState([]);
  const [showBookedSpacesError, setShowBookedSpacesError] = useState(false);
  const [bookedSpacesFetched, setBookedSpacesFetched] = useState(false);

  const [adminUsers, setAdminUsers] = useState([]);
  const [showAdminUsersError, setShowAdminUsersError] = useState(false);
  const [adminUsersFetched, setAdminUsersFetched] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

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
      const { data } = await axios.post(`/api/user/update/${currentUser._id}`, formData);
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
      const { data } = await axios.delete(`/api/user/delete/${currentUser._id}`);
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
      const { data } = await axios.post(`/api/auth/signout`);
      if (data.success === false) {
        toast.error(data.message, { duration: 3000 });
        dispatch(signOutUserFailure(data));
        return;
      }
      dispatch(signOutUserSuccess(data));
      toast.success('Signed out successfully!', { duration: 3000 });
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message, { duration: 3000 });
      dispatch(signOutUserFailure(error.message));
    }
  };

  const handleShowListings = async () => {
    if (listingsFetched) {
      setUserListings([]);
      setListingsFetched(false);
      return;
    }
    try {
      setShowListingsError(false);
      const { data } = await axios.get(`/api/user/listings/${currentUser._id}`);
      if (data.success === false) return setShowListingsError(true);
      setUserListings(data);
      setListingsFetched(true);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const { data } = await axios.delete(`/api/listing/delete/${listingId}`);
      if (data.success === false) return toast.error(data.message);
      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));
      toast.success('Listing deleted!');
    } catch (error) {
      console.log(error.message);
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
      const { data } = await axios.get(`/api/user/spaces/${currentUser._id}`);
      if (data.success === false) return setShowBookedSpacesError(true);
      setBookedSpaces(data);
      setBookedSpacesFetched(true);
    } catch (error) {
      setShowBookedSpacesError(true);
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
      const { data } = await axios.get(`/api/admin/users/${currentUser._id}`);
      if (data.success === false) return setShowAdminUsersError(true);
      setAdminUsers(data);
      setAdminUsersFetched(true);
    } catch (error) {
      setShowAdminUsersError(true);
    }
  };
  const handleUpdateListingSuccess = (updatedListing) => {
    setUserListings((prev) => prev.map((l) => l._id === updatedListing._id ? updatedListing : l));
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
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
                <div>
                  <h2 className='text-2xl font-bold text-slate-900'>My Team</h2>
                  <p className='text-sm text-slate-500'>Manage your assigned users</p>
                </div>
                
                <div className='flex items-center gap-3'>
                  <SmartButton 
                    actionFunction={handleShowAdminUsers}
                    colorClass="!bg-white !text-slate-700 border border-slate-200 hover:!bg-slate-100 !px-5 !py-2 !rounded-full shadow-sm text-sm font-medium transition-all"
                    text={adminUsersFetched ? "Hide Users" : "Show Users"}
                    showAlert={false}
                  /> 
                </div>
              </div>

              <div className='flex-grow overflow-y-auto pr-2 custom-scrollbar'>
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
                
                {!adminUsersFetched && (
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
                    <img src="/images/empty-calendar.svg" alt="No booked spaces" className="w-32 h-32 mb-4 opacity-50" onError={(e) => e.target.style.display='none'} />
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
                      <div key={space._id} className='bg-white border border-slate-100 rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow'>
                        <div className='flex justify-between items-start'>
                           <h3 className='font-semibold text-slate-800'>{space.listingName || 'Workspace Booking'}</h3>
                           <span className='text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full'>{space.status || 'Confirmed'}</span>
                        </div>
                        <p className='text-sm text-slate-500'>Date: {new Date(space.date).toLocaleDateString()}</p>
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
            </>
          ) : (
            <>
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
                <div>
                  <h2 className='text-2xl font-bold text-slate-900'>My Workspace Listings</h2>
                  <p className='text-sm text-slate-500'>Manage your shared spaces</p>
                </div>
                
                <div className='flex items-center gap-3'>
                  <button onClick={() => setIsCreateModalOpen(true)} className='bg-slate-900 text-white hover:bg-slate-800 px-5 py-2 rounded-full shadow-sm text-sm font-medium transition-all flex items-center gap-1'>
                    <span className='text-lg leading-none mb-[2px]'>+</span> Create New
                  </button>
                  <SmartButton actionFunction={handleShowListings} colorClass="!bg-white !text-slate-700 border border-slate-200 hover:!bg-slate-100 !px-5 !py-2 !rounded-full shadow-sm text-sm font-medium transition-all" text={listingsFetched ? "Hide Listings" : "Show Listings"} showAlert={false}/> 
                </div>
              </div>

              <div className='flex-grow overflow-y-auto pr-2 custom-scrollbar'>
                {showListingsError && <p className='text-red-500 text-sm p-4 bg-red-50 rounded-xl text-center'>Error fetching listings!</p>}

                {listingsFetched && userListings.length === 0 && !showListingsError && (
                  <div className='flex flex-col items-center justify-center h-full text-center opacity-70 py-10'>
                    <img src="/images/empty-state.svg" alt="No listings" className="w-32 h-32 mb-4 opacity-50" onError={(e) => e.target.style.display='none'} />
                    <p className='text-lg font-semibold text-slate-700'>No listings found</p>
                    <p className='text-sm text-slate-500 mb-4'>You haven't created any workspaces yet.</p>
                    <button onClick={() => setIsCreateModalOpen(true)} className='text-green-600 font-semibold hover:underline text-sm'>Click here to create one</button>
                  </div>
                )}

                {userListings && userListings.length > 0 && (
                  <div className='flex flex-col gap-4'>
                    {userListings.map((listing) => (
                      <div key={listing._id} className='bg-white border border-slate-100 rounded-2xl p-3 flex justify-between items-center gap-4 hover:shadow-md transition-shadow group'>
                        <Link to={`/listing/${listing._id}`} className='flex items-center gap-4 flex-1 truncate'>
                          <img src={listing.imageUrls[0]} alt='listing cover' className='h-16 w-24 object-cover rounded-lg bg-slate-100' />
                          <p className='text-slate-800 font-semibold truncate group-hover:text-green-700 transition-colors'>{listing.name}</p>
                        </Link>
                        <div className='flex flex-col md:flex-row gap-2 md:gap-4 px-2'>
                          <button 
                              onClick={() => {
                                setListingToEdit(listing);
                                setIsUpdateModalOpen(true);
                              }} 
                              className='text-slate-400 hover:text-slate-900 font-medium text-sm transition-colors'
                            >
                              Edit
                            </button>
                          <button onClick={() => handleListingDelete(listing._id)} className='text-red-400 hover:text-red-600 font-medium text-sm transition-colors'>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {!listingsFetched && (
                  <div className='flex items-center justify-center h-full text-center opacity-50 py-10'>
                     <p className='text-sm text-slate-500'>Click "Show Listings" to view your properties.</p>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>
      
      <CreateListingModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <UpdateListingModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} listing={listingToEdit}  onUpdateSuccess={handleUpdateListingSuccess}
      />
    </div>
  );
}