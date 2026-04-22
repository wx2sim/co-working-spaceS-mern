import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import AnimatedPage from '../components/AnimatedPage';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function VerifyEmail() {
  useDocumentTitle('Verify Email | Co-Spaces');
  const { currentUser } = useSelector((state) => state.user);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const email = location.state?.email || currentUser?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/signup');
      toast.error('Please sign up first');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      return toast.error('Please enter all 6 digits');
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-email`, {
        email,
        otp: otpString,
      });

      if (data.success) {
        toast.success('Email verified successfully!');
        
        // Use updated user data from response to unlock features instantly
        if (data.user) {
          dispatch(signInSuccess(data.user));
        }

        setOtp(['', '', '', '', '', '']);
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResendLoading(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/resend-otp`, { email });
      if (data.success) {
        if (data.emailSent === false) {
          toast.error(data.message || 'Failed to send email. Check server configuration.');
        } else {
          toast.success('New OTP sent to your email');
          setTimer(60);
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0].focus();
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className='min-h-screen pt-32 pb-10 px-4 flex items-center justify-center bg-slate-50'>
        <div className='max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100'>
          <div className='text-center mb-10'>
            <h1 className='text-3xl font-black text-slate-900 mb-2'>Verify Your Email</h1>
            <p className='text-slate-500 text-sm'>
              We've sent a 6-digit code to <br />
              <span className='font-bold text-slate-900'>{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-8'>
            <div className='flex justify-between gap-2'>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type='text'
                  maxLength='1'
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  autoFocus={index === 0}
                  className='w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:ring-0 focus:bg-white transition-all outline-none'
                />
              ))}
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50'
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          <div className='mt-8 text-center'>
            <p className='text-slate-500 text-sm mb-4'>Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={timer > 0 || resendLoading}
              className={`text-sm font-bold transition-all ${
                timer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-700 hover:underline'
              }`}
            >
              {resendLoading ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
            </button>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
