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



export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file , setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
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
        <Link  className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'>
          Create Listing
        </Link>
       </form>
       <div className='flex justify-between mt-5'>
            <Popconfirm
                 title="Alert"
                 description="Do u really want to delete your Account"
                 okButtonProps={{ danger: true }}
                 onConfirm={handleDeleteUser}
                 onOpenChange={() => console.log('open change')}
               >
              <Button className='bg-red-500 text-white' type="primary" danger>Delete Account</Button>
            </Popconfirm>
            <Button onClick={handleSignOut} type="primary" className="!bg-teal-700 hover:!opacity-80 !border-teal-700 hover:!border-teal-300 !text-white">Sign Out</Button>
      </div>
      
      <button  className='text-green-700 w-full'>
        Show Listings
      </button>
      

     <div className='flex flex-col gap-4'>
          <h1 className='text-center mt-7 text-2xl font-semibold'>
            Your Listings
          </h1>
         
      </div>
    </div>
  );
}