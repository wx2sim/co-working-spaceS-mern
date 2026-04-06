import { useSelector } from 'react-redux';
import {  useRef, useState, useEffect } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';



export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file , setFile] = useState(undefined);
   const [filePerc, setFilePerc] = useState(0);
   const [fileUploadError, setFileUploadError] = useState(false);
   const [formData, setFormData] = useState({});
   
  
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
  const fileRef = useRef(null);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  if (!currentUser) return null;
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form className='flex flex-col gap-4'>
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
        <Link
          className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'
          to={'/'}
        >
          Create Listing
        </Link>
      </form>
      <div className='flex justify-between mt-5'>
        <span
          
          className='text-slate-700 cursor-pointer hover:underline'
        >
          Delete account
        </span>
        <span  className='text-slate-700 cursor-pointer hover:underline'>
          Sign out
        </span>
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