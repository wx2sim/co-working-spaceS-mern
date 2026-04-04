import React from 'react'
import { Link } from 'react-router-dom'



function SignUp() {
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl  text-center font-semibold my-7'>
        Sign Up
      </h1>
      <form className='flex flex-col gap-4 '>
        <input type="text" placeholder='Username' className='border p-3 rounded-lg ' id='username'/>
        <input type="email" placeholder='email' className='border p-3 rounded-lg ' id='email'/>
        <input type="password" placeholder='password' className='border p-3 rounded-lg ' id='password'/>
        <button className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-85' > Sign up</button>
      </form>
      <div className='flex gap-2 mt-3'>
        <p>Have an Account ?</p>
        <Link to={"/signin"}>
        <span className='text-slate-700 '>Sign in</span>
        </Link >
      </div>
    </div>
  )
}

export default SignUp