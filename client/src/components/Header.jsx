import { FaSearch } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileDropdown from './ProfileDropdown';

function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation(); // Imported useLocation to prevent errors

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  return (
    <header className='fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300'>
      <div className='flex justify-between items-center max-w-6xl mx-auto p-4'>
        
        {/* Logo Section */}
        <Link to='/' className='flex items-center'>
          <h1 className='text-xl sm:text-2xl flex flex-wrap tracking-tight'>
            <span className='font-light text-slate-500'>Co</span>
            <span className='font-extrabold text-slate-900'>Space</span>
          </h1>
        </Link>

        {/* Search Bar Section */}
        <form
          onSubmit={handleSubmit}
          className='bg-slate-50 border border-slate-200 px-4 py-2 rounded-full flex items-center shadow-inner focus-within:ring-2 focus-within:ring-slate-300 focus-within:bg-white transition-all duration-300'
        >
          <input
            type='text'
            placeholder='Search...'
            className='bg-transparent focus:outline-none w-28 sm:w-64 sm:focus:w-72 transition-all duration-300 text-sm text-slate-700 placeholder-slate-400'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type='submit' className='flex items-center justify-center pl-2'>
            <FaSearch className='text-slate-400 hover:text-slate-700 transition-colors duration-300' />
          </button>
        </form>

        {/* Navigation Section */}
        <ul className='flex items-center gap-6'>
          <li className='hidden sm:block'>
            <Link 
              to='/' 
              className='text-slate-600 font-medium transition-colors duration-300 hover:text-slate-900 relative group'
            >
              Home
              {/* Smooth Animated Underline */}
              <span className='absolute left-0 -bottom-1 w-0 h-[2px] bg-slate-900 transition-all duration-300 group-hover:w-full'></span>
            </Link>
          </li>
          <li className='hidden sm:block'>
            <Link 
              to='/about' 
              className='text-slate-600 font-medium transition-colors duration-300 hover:text-slate-900 relative group'
            >
              About
              {/* Smooth Animated Underline */}
              <span className='absolute left-0 -bottom-1 w-0 h-[2px] bg-slate-900 transition-all duration-300 group-hover:w-full'></span>
            </Link>
          </li>
          <li>
            <ProfileDropdown currentUser={currentUser} />
          </li>
        </ul>
        
      </div>
    </header>
  );
}

export default Header;