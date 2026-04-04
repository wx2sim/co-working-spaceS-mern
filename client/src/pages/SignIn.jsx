import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { useDispatch ,  } from 'react-redux'
import {signInStart, signInSuccess, signInFailure} from '../redux/user/userSlice.js'

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validate = () => {
    let newErrors = { email: '', password: '' };
    let isValid = true;

    if (!formData.password || formData.password.length < 6) { 
      newErrors.password = 'Password was at least 6 characters';
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
      dispatch(signInStart())
      const { data } = await axios.post('/api/auth/signin', formData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      dispatch(signInSuccess(data));
      setLoading(false);
      navigate('/');

    } catch (error) {
     dispatch(signInFailure()); 
  setLoading(false);
  const message = error.response?.data?.message || '';

  if (message.toLowerCase().includes('not found')) {
    setError(prev => ({ ...prev, email: 'No account found with this email' }));
  } else if (message.toLowerCase().includes('wrong credentials')) {
    setError(prev => ({ ...prev, password: 'Incorrect password' }));
  } else {
    setError(prev => ({ ...prev, email: 'Something went wrong, try again' }));
  }
}
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-4xl text-center font-semibold my-7'>Sign In</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div>
          <input type="email" placeholder='Email' className='border p-3 rounded-lg w-full' id='email' onChange={handleChange} />
          {error.email && <span className='text-red-500 text-sm'>{error.email}</span>}
        </div>

        <div>
          <input type="password" placeholder='Password' className='border p-3 rounded-lg w-full' id='password' onChange={handleChange} />
          {error.password && <span className='text-red-500 text-sm'>{error.password}</span>}
        </div>

        <button disabled={loading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-85'>
          {loading ? 'Loading...' : 'Sign In'}
        </button>
      </form>

      <div className='flex gap-2 mt-3'>
        <p>Dont Have an Account?</p>
        <Link to={"/signup"}>
          <span className='text-slate-700'>Sign up</span>
        </Link>
      </div>
    </div>
  );
}