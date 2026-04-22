import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import OAuth from '../components/OAuth';
import AnimatedPage from '../components/AnimatedPage';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function SignUp() {
  useDocumentTitle('Sign Up | Co-Spaces');
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
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`, formData);
      setLoading(false);
      toast.success('Account created! Please sign in to verify your email.');
      navigate('/signin', { state: { email: formData.email } });

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
      {/* Wrapper to center the card on the screen */}
      <div className='min-h-screen flex items-center justify-center p-4 pt-28 pb-10'>
        
        {/* The Premium Card */}
        <div className='bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-100 w-full max-w-md'>
          
          {/* Header Text */}
          <div className='text-center mb-4'>
            <h1 className='text-3xl font-extrabold text-slate-900 mb-2'>Create Account</h1>
            <p className='text-slate-500 font-light'>Join CoSpace today.</p>
          </div>

          <form onSubmit={handleSubmit} className='flex flex-col gap-1'>
            
            <div>
              <input 
                type="text" 
                autoComplete="off" 
                placeholder='Username' 
                className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all duration-300' 
                id='username' 
                onChange={handleChange} 
              />
              {error.username && <span className='text-red-500 text-xs mt-1 ml-1'>{error.username}</span>} 
            </div>

            <div>
              <input 
                type="email" 
                autoComplete="off" 
                placeholder='Email' 
                className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all duration-300' 
                id='email' 
                onChange={handleChange} 
              />
              {error.email && <span className='text-red-500 text-xs mt-1 ml-1'>{error.email}</span>}
            </div>

            <div>
              <input 
                type="password" 
                autoComplete="new-password" 
                placeholder='Password' 
                className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all duration-300' 
                id='password' 
                onChange={handleChange} 
              />
              {error.password && <span className='text-red-500 text-xs mt-1 ml-1'>{error.password}</span>}
            </div>

            <button 
              disabled={loading} 
              className='w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-all duration-300 disabled:opacity-70 mt-2'
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>

            {/* Classy Divider */}
            <div className='relative flex items-center py-2'>
              <div className='flex-grow border-t border-slate-200'></div>
              <span className='flex-shrink-0 mx-4 text-slate-400 text-sm'>or continue with</span>
              <div className='flex-grow border-t border-slate-200'></div>
            </div>

            <OAuth />
          </form>

          {/* Footer Link */}
          <div className='flex justify-center gap-2 mt-4 text-slate-600'>
            <p>Already have an account?</p>
            <Link to="/signin" className='text-slate-900 font-semibold hover:underline transition-all'>
              Sign in
            </Link>
          </div>

        </div>
      </div>
    </AnimatedPage>
  );
}