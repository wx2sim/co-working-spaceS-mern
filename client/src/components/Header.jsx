import { FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileDropdown from './ProfileDropdown';


function Header() {
  const { currentUser } = useSelector(state => state.user);
  return (
    <header className='bg-slate-200 shadow-md sticky top-0 z-10'>
        <div className='flex justify-between items-center max-w-6xl mx-auto p-3'>
            <Link to='/'>
        <h1 className='font-bold test-sm sm:text-xl flex flex-wrap '>
        <span className='text-slate-500'>Co</span>
        <span className='text-slate-700'>Space</span> 
        </h1>
        </Link>
        <form className='bg-slate-100 p-3 rounded-lg flex items-center'>
            <input type="text" placeholder='Search ...' className='bg-transparent focus:outline-none w-24 sm:w-64   '/>
            <FaSearch className='text-slate-600' /> 
        </form> 
        <ul className='flex gap-4'>
           <Link to='/'> <li className='hidden sm:inline text-slate-700 hover:underline'>Home</li> </Link>
           <Link to='/about'> <li className='hidden sm:inline text-slate-700 hover:underline'>About</li> </Link>
           <ProfileDropdown />
        </ul>
        </div>
    </header>
  )
}

export default Header