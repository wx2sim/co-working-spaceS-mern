import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios';
import OAuth from '../components/OAuth';
import AnimatedPage from '../components/AnimatedPage';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    let newErrors = { username: '', email: '', password: '' };
    let isValid = true;

    if (!formData.password || formData.password.length < 6) { 
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    setError(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const { data } = await axios.post('/api/auth/signup', formData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLoading(false);
      navigate('/signin');

    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message  || ''; 

      if (message.toLowerCase().includes('email')) {
        setError(prev => ({ ...prev, email: 'Email is already in use' }));
      } else if (message.toLowerCase().includes('username')) {
        setError(prev => ({ ...prev, username: 'Username is already taken' }));
      }
    }
  };

  return (
    <AnimatedPage>
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-4xl text-center font-semibold my-7'>Sign Up</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>

        <div>
          <input type="text" autoComplete="off" placeholder='Username' className='border p-3 rounded-lg w-full' id='username' onChange={handleChange} />
          {error.username && <span className='text-red-500 text-sm'>{error.username}</span>} 
        </div>

        <div>
          <input type="email" autoComplete="off" placeholder='Email' className='border p-3 rounded-lg w-full' id='email' onChange={handleChange} />
          {error.email && <span className='text-red-500 text-sm'>{error.email}</span>}
        </div>

        <div>
          <input type="password" autoComplete="new-password" placeholder='Password' className='border p-3 rounded-lg w-full' id='password' onChange={handleChange} />
          {error.password && <span className='text-red-500 text-sm'>{error.password}</span>}
        </div>

        <button disabled={loading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-85'>
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
        <OAuth />
      </form>

      <div className='flex gap-2 mt-3'>
        <p>Have an Account?</p>
        <Link to={"/signin"}>
          <span className='text-slate-700'>Sign in</span>
        </Link>
      </div>
    </div>
    </AnimatedPage>
  );
}