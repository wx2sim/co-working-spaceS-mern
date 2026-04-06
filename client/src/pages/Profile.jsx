import { useSelector } from 'react-redux';
import {  useRef, useState, useEffect } from 'react';

import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';



export default function Profile() {

  
  
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({});
  const fileRef = useRef(null);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  if (!currentUser) return null;
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={''} className='flex flex-col gap-4'>
        <input
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
        />
        <img
          onClick={''}
          src={formData.avatar || currentUser?.avatar}
          alt='profile'
          className='rounded-full h-20 w-20 object-cover cursor-pointer self-center mt-2'
        />
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
          onClick={''}
          className='text-slate-700 cursor-pointer'
        >
          Delete account
        </span>
        <span onClick={''} className='text-slate-700 cursor-pointer'>
          Sign out
        </span>
      </div>
      <button onClick={''} className='text-green-700 w-full'>
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