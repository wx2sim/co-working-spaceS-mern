import { useSelector } from 'react-redux';
import {  useRef, useState, useEffect } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { Link , useNavigate} from 'react-router-dom';
import {updateUserStart, updateUserSuccess, updateUserFailure, deleteUserFailure, deleteUserStart, deleteUserSuccess, signOutUserStart, signOutUserFailure, signOutUserSuccess} from '../redux/user/userSlice.js';
import axios from 'axios';
import toast from 'react-hot-toast'; 
import { Button, Popconfirm } from 'antd';
import SmartButton from '../components/SmartButton.jsx';
import SmartModal from '../components/SmartModal.jsx';



export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file , setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
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
    uploadTask.on( 'state_changed', (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
    },
    (error) => {
        setFileUploadError(true);
    },
    () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => setFormData({ ...formData, avatar: downloadURL })
        );
    }
    );
  
  };
  const handleSubmit = async (e) => {
      e.preventDefault();
     try {
      dispatch(updateUserStart());
      const { data } = await axios.post(`/api/user/update/${currentUser._id}`, formData);
      console.log(data);
      if (data.success === false) {
        toast.error(data.message, { duration: 3000 });
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
       toast.success('User updated successfully!', { duration: 3000 }); 
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
       toast.success('User deleted successfully!', { duration: 3000 });
      
    } catch (error) {
      const message = error.response?.data?.message || error.message;
        toast.error(message, { duration: 3000 });
        dispatch(deleteUserFailure(error.message));
    }
  };
  const handleSignOut = async ()=> {
    try {
      dispatch(signOutUserStart());
      const { data } = await axios.post(`/api/auth/signout`);
      console.log(data);
      if (data.success === false) {
        toast.error(data.message, { duration: 3000 });
        dispatch(signOutUserFailure(data));
        return;
      }
      dispatch(signOutUserSuccess(data));
       toast.success('User Signed out successfully!', { duration: 3000 });
      
    } catch (error) {
      const message = error.response?.data?.message || error.message;
        toast.error(message, { duration: 3000 });
        dispatch(signOutUserFailure(error.message));
    }
  };
  const fileRef = useRef(null);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  if (!currentUser) return null;
  const confirm = () =>
    new Promise(resolve => {
      setTimeout(() => resolve(null), 3000);
    });


  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const { data }  = await axios.get(`/api/user/listings/${currentUser._id}`)
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const { data } = await axios.delete(`/api/listing/delete/${listingId}`)
      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error.message);
    }
  };  
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
        />
        <img
          onClick={()=> fileRef.current.click()}
          src={formData.avatar || currentUser?.avatar}
          alt='profile'
          className='rounded-full h-20 w-20 object-cover cursor-pointer self-center mt-2'
          referrerPolicy='no-referrer'
        />
        <p className='text-center'>
          {fileUploadError ?
          <span className='text-red-700'>
            Error Image upload(image must be less than 2 MB)
          </span> : (filePerc > 0 && filePerc < 100) ? (
          <span className='text-slate-500'>{`Uploading ${filePerc}%`}</span> 
          ) :  filePerc === 100 ? (
           <span className='text-green-500'>{'Image uploaded Successfully'}</span> 
          ) : ('')

          }
        </p>
        <input
          type='text'
          placeholder='username'
          defaultValue={currentUser.username}
          id='username'
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          type='email'
          placeholder='email'
          id='email'
          defaultValue={currentUser.email}
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          type='password'
          placeholder='password'
          onChange={handleChange}
          id='password'
          className='border p-3 rounded-lg'
        />
        <button
          disabled={loading}
          className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? 'Loading...' : 'Update'}
        </button>
        <Link to={'/createlisting'}  className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'>
          Create Listing
        </Link>
       </form>
       <div className='flex justify-between mt-5'>
        <SmartModal 
        triggerText="Delete Account"
        triggerColorClass="!bg-red-500 !text-white !border-transparent bg-red-500 hover:!opacity-60 hover:!border-red-500 text-white "
        modalTitle="Confirmation"
        modalContent="Do you want to delete your Account?"
        cancelColorClass="!bg-green-600 hover:!text-white !border-white hover:!bg-green-500 hover:!opacity-80  text-white "
        okText="Yes, Delete"
        okColorClass="bg-red-600 !text-white hover:!text-black hover:!opacity-80 hover:!border-red-500 "
        onOkAction={handleDeleteUser} 
         />
         <SmartButton 
        actionFunction={handleShowListings}
        colorClass="!bg-slate-700 hover:!opacity-85"
        text="Show Listings"
        showAlert={false}
      />   
        <SmartButton 
        actionFunction={handleSignOut}
        colorClass="!bg-teal-700 hover:!opacity-80"
        text="Sign Out"
        showAlert={false} 
      />   
           
      </div>
      
      {userListings && userListings.length > 0 && (
        <div className='flex flex-col gap-4'>
          <h1 className='text-center mt-7 text-2xl font-semibold'>
            My Listings
          </h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className='border rounded-lg p-3 flex justify-between items-center gap-4'
            >
              <Link to={``}>
                <img
                  src={listing.imageUrls[0]}
                  alt='listing cover'
                  className='h-16 w-16 object-contain'
                />
              </Link>
              <Link
                className='text-slate-700 font-semibold  hover:underline truncate flex-1'
                to={``}
              >
                <p>{listing.name}</p>
              </Link>

              <div className='flex flex-col item-center'>
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className='text-red-700 uppercase'
                >
                  Delete
                </button>
                <Link to={`/updatelisting/${listing._id}`}>
                  <button className='text-green-700 uppercase'>Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    
      
          
         
      </div>
    
  );
}