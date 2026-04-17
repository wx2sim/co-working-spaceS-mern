import { FaSearch, FaBars, FaTimes, FaSun, FaMoon } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import { Drawer } from 'antd';
import ProfileDropdown from './ProfileDropdown';
import SmartButton from '../components/SmartButton';
import axios from 'axios';
import { useSocketContext } from '../context/SocketContext';
import toast from 'react-hot-toast';

function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const { socket } = useSocketContext();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
  const [unseenStatusCount, setUnseenStatusCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      const fetchUnread = async () => {
        try {
          const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/message/unread-count`);
          setUnreadCount(data.count || 0);
        } catch (error) {
          console.log(error);
        }
      };

      const fetchPending = async () => {
        if (currentUser.role === 'admin' || currentUser.role === 'user' || currentUser.role === 'superadmin') {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/booking/pending-count`);
                setPendingBookingsCount(data.count || 0);
            } catch (error) { console.log(error); }
        }
        if (currentUser.role === 'client') {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/booking/unseen-status-count`);
                setUnseenStatusCount(data.count || 0);
            } catch (error) { console.log(error); }
        }
      }

      // Fetch immediately on mount or user change
      fetchUnread();
      fetchPending();

      // Poll every 30 seconds for new messages and bookings
      const interval = setInterval(() => {
        fetchUnread();
        fetchPending();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Socket.io listeners
  useEffect(() => {
    if (socket) {
      socket.on('new_booking_request', (data) => {
        toast.success(`📅 ${data.message}`, {
            duration: 5000,
            icon: '🏢'
        });
        setPendingBookingsCount(prev => prev + 1);
      });

      socket.on('receive_message', (message) => {
        toast(`✉️ New message: ${message.content.substring(0, 30)}...`, {
            duration: 4000,
            icon: '💬'
        });
        // Optionally refetch unread count
        const fetchUnread = async () => {
            const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/message/unread-count`);
            setUnreadCount(data.count || 0);
        };
        fetchUnread();
      });

      socket.on('booking_status_updated', (data) => {
        toast.success(`📢 ${data.message}`, {
            duration: 6000,
        });
        if (currentUser.role === 'client') {
            setUnseenStatusCount(prev => prev + 1);
        }
      });

      return () => {
        socket.off('new_booking_request');
        socket.off('receive_message');
        socket.off('booking_status_updated');
      };
    }
  }, [socket]);

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

  const NavLink = ({ to, text, onClick, badge }) => (
    <li className='relative'>
      <Link
        to={to}
        onClick={onClick}
        className='text-slate-600 text-base md:text-sm font-medium transition-colors duration-300 hover:text-slate-900 relative group whitespace-nowrap block'
      >
        {text}
        {badge > 0 && (
          <span className="absolute -top-1.5 -right-3 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
        <span className='absolute left-0 -bottom-1 w-0 h-[2px] bg-slate-900 transition-all duration-300 group-hover:w-full'></span>
      </Link>
    </li>
  );

  const renderLinks = (isMobile = false) => {
    const handleLinkClick = () => { if (isMobile) setIsDrawerOpen(false); };

    if (currentUser?.role === 'admin') {
      return (
        <>
          <NavLink to='/admin/users' text='Users' onClick={handleLinkClick} />
          <NavLink to='/schedule' text='Messages' onClick={handleLinkClick} badge={unreadCount} />
          <NavLink to='/dashboard' text='Dashboard' onClick={handleLinkClick} />
        </>
      );
    }

    if (currentUser?.role === 'user') {
      return (
        <>
          <NavLink to='/' text='Home' onClick={handleLinkClick} />
          <NavLink to='/about' text='About' onClick={handleLinkClick} />
          <NavLink to='/schedule' text='Schedule' onClick={handleLinkClick} badge={unreadCount} />
          <li>
            <SmartButton
              actionFunction={() => { navigate('/dashboard'); handleLinkClick(); }}
              colorClass="!bg-slate-900 !text-white hover:!bg-slate-800 !px-5 !py-2 !rounded-full shadow-sm text-sm font-medium transition-all w-full md:w-auto"
              text="Dashboard"
              showAlert={false}
              badge={unseenStatusCount}
            />
          </li>
        </>
      );
    }

    return (
      <>
        <NavLink to='/' text='Home' onClick={handleLinkClick} />
        <NavLink to='/about' text='About' onClick={handleLinkClick} />
        <NavLink to='/map' text='Map' onClick={handleLinkClick} />
        {currentUser && (
          <>
            <NavLink to='/schedule' text='Messages' onClick={handleLinkClick} badge={unreadCount} />
            <NavLink to='/dashboard' text='Dashboard' onClick={handleLinkClick} badge={pendingBookingsCount} />
          </>
        )}
      </>
    );
  };

  return (
    <header className='fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300'>
      <div className='flex justify-between items-center max-w-6xl mx-auto p-4'>

        <div className='flex items-center gap-3 shrink-0'>
          {!isSearchExpanded && (
            <button className='md:hidden text-slate-600 hover:text-slate-900 transition-colors' onClick={() => setIsDrawerOpen(true)}>
              <FaBars size={22} />
            </button>
          )}
          <Link to='/' className='flex items-center'>
            <h1 className='text-xl sm:text-2xl flex flex-wrap tracking-tight'>
              <span className='font-light text-slate-500'>Co</span>
              <span className='font-extrabold text-slate-900'>Space</span>
            </h1>
          </Link>
        </div>

        {(!currentUser || currentUser.role === 'client') && (
          <form
            onSubmit={handleSubmit}
            className={`bg-slate-50 border border-slate-200 px-4 py-2 rounded-full items-center shadow-inner focus-within:ring-2 focus-within:ring-slate-300 focus-within:bg-white transition-all duration-300 mx-2 sm:mx-4 
              ${isSearchExpanded ? 'flex flex-1' : 'hidden md:flex flex-1 max-w-md'}`
            }
          >
            <input
              type='text'
              placeholder='Search workspaces...'
              className='bg-transparent focus:outline-none w-full transition-all duration-300 text-sm text-slate-700 placeholder-slate-400'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type='submit' className='flex items-center justify-center pl-2'>
              <FaSearch className='text-slate-400 hover:text-slate-700 transition-colors duration-300' />
            </button>
          </form>
        )}

        {isSearchExpanded ? (
          <button className='md:hidden text-slate-500 hover:text-red-500 transition-colors p-2' onClick={() => setIsSearchExpanded(false)}>
            <FaTimes size={24} />
          </button>
        ) : (
          <div className='flex items-center gap-4 sm:gap-6'>
            <ul className='hidden md:flex items-center gap-6'>
              {renderLinks(false)}
            </ul>

            {(!currentUser || currentUser.role === 'client') && (
              <button className='md:hidden text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white transition-colors' onClick={() => setIsSearchExpanded(true)}>
                <FaSearch size={20} />
              </button>
            )}

            <button
              onClick={() => dispatch(toggleTheme())}
              className='w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:shadow-md transition-all'
            >
              {theme === 'light' ? <FaMoon size={16} /> : <FaSun size={16} />}
            </button>

            <ProfileDropdown currentUser={currentUser} />
          </div>
        )}

      </div>

      <Drawer
        title={<span className="font-extrabold text-slate-900 text-xl">Menu</span>}
        placement="left"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        size={260}
      >
        <ul className="flex flex-col gap-6 mt-4">
          {renderLinks(true)}
        </ul>
      </Drawer>

    </header>
  );
}

export default Header;