import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import SmartModal from '../components/SmartModal';
import {
  signInStart,
  signInSuccess,
  signInFailure,
  clearError,
} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';
import AnimatedPage from '../components/AnimatedPage';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (error) {const timer = setTimeout(() => {
        dispatch(clearError());
      }, 3500); 
      
      return () => clearTimeout(timer); 
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const { data } = await axios.post('/api/auth/signin', formData);
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      console.log("Raw Error from Backend:", error.response);
      const errorMessage = error.response?.data?.message || error.message;
      dispatch(signInFailure(errorMessage));
    }
  };

  return (
    <AnimatedPage>
      {/* Wrapper to center the card on the screen */}
      <div className='min-h-screen flex items-center justify-center p-4 pt-28 pb-10'>
        
        {/* The Premium Card */}
        <div className='bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-100 w-full max-w-md'>
          
          {/* Header Text */}
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-extrabold text-slate-900 mb-2'>Welcome Back</h1>
            <p className='text-slate-500 font-light'>Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className='flex flex-col gap-1'>
            <div>
              <input
                type='email'
                placeholder='Email'
                className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all duration-300'
                id='email'
                onChange={handleChange}
              />
            </div>
            
            <div>
              <input
                type='password'
                placeholder='Password'
                className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white transition-all duration-300'
                id='password'
                onChange={handleChange}
              />
            </div>

            <button
              disabled={loading}
              className='w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-all duration-300 disabled:opacity-70 mt-2'
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Classy Divider */}
            <div className='relative flex items-center py-2'>
              <div className='flex-grow border-t border-slate-200'></div>
              <span className='flex-shrink-0 mx-4 text-slate-400 text-sm'>or continue with</span>
              <div className='flex-grow border-t border-slate-200'></div>
            </div>

            <OAuth />
          </form>

          {/* Error Message */}
          {error && (
           <SmartModal 
            showTrigger={false} 
            showCancel={false}  
            isOpen={!!error}   
            onClose={() => dispatch(clearError())} 
            modalTitle="Authentication Failed"
            modalContent={<span className="text-red-500 font-medium">{error}</span>}
            okText="Got it"
            okColorClass="bg-red-600 hover:bg-red-700 text-white"
          />
          )}

        
          <div className='flex justify-center gap-2 mt-4 text-slate-600'>
            <p>Don't have an account?</p>
            <Link to='/signup' className='text-slate-900 font-semibold hover:underline transition-all'>
              Sign up
            </Link>
          </div>

        </div>
      </div>
    </AnimatedPage>
  );
}