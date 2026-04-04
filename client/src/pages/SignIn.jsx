import React from 'react'
import { Link } from 'react-router-dom'


export default function SignIn() {
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-4xl  text-center font-semibold my-7'>
        Sign In
      </h1>
      <form className='flex flex-col gap-4 '>
        
        <input type="email" placeholder='email' className='border p-3 rounded-lg ' id='email'/>
        <input type="password" placeholder='password' className='border p-3 rounded-lg ' id='password'/>
        <button className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-85' > Sign up</button>
      </form>
      <div className='flex gap-2 mt-3'>
        <p>Don't Have an Account ?</p>
        <Link to={"/signup"}>
        <span className='text-slate-700 '>Sign up</span>
        </Link >
      </div>
    </div>
  )
}

