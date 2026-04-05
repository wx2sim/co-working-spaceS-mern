import React from 'react'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { app } from '../firebase'
import { useDispatch, useSelector } from 'react-redux';
import { signInSuccess ,signInFailure } from '../redux/user/userSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';



function OAuth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleGoogleClick = async() => {
        try {
            const provider = new GoogleAuthProvider();
            const auth = getAuth(app);
            const result = await signInWithPopup(auth , provider);
            const { data } = await axios.post('/api/auth/google', {
             name: result.user.displayName,
             email: result.user.email,
             photo: result.user.photoURL,
            });
            if (data.success === false) {
                    dispatch(signInFailure(data.message));
                    return;
            }
            console.log('Google signin data:', data);
            dispatch(signInSuccess(data));
            navigate('/');
            
            
        } catch (error) {
            console.log("Could not sign with google", error)
        }
    }
  return (
    <button onClick={handleGoogleClick} type='button' className='bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-80 disabled:opacity-85'>
          Sign With Google
        </button>
  )
}

export default OAuth