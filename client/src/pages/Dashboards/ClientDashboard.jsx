import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AnimatedPage from '../../components/AnimatedPage';
import {
  FaSearch, FaMapMarkerAlt, FaCalendarCheck, FaArrowUp,
  FaClock, FaHeart, FaCompass, FaRegBookmark
} from 'react-icons/fa';

export default function ClientDashboard() {
  const { currentUser } = useSelector((state) => state.user);
  const [recentListings, setRecentListings] = useState([]);
  const [bookedSpaces, setBookedSpaces] = useState([]);
  const [upgradeStatus, setUpgradeStatus] = useState('none');
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const { data } = await axios.get('/api/listing/get?limit=4&sort=createdAt&order=desc');
        setRecentListings(data);
      } catch (err) {
        console.log('Could not fetch listings');
      } finally {
        setLoadingListings(false);
      }
    };

    const fetchBookings = async () => {
      try {
        const { data } = await axios.get('/api/booking/client');
        setBookedSpaces(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch (err) {
        console.log('Could not fetch bookings');
      } finally {
        setLoadingBookings(false);
      }
    };

    const checkUpgrade = async () => {
      try {
        const { data } = await axios.get('/api/upgrade/my-status');
        setUpgradeStatus(data.status);
      } catch (err) { /* ignore */ }
    };

    fetchRecent();
    fetchBookings();
    checkUpgrade();
  }, [currentUser._id]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <AnimatedPage>
      <div className='min-h-screen pt-24 pb-10 px-4 max-w-6xl mx-auto'>

        {/* Welcome Header */}
        <div className='mb-8'>
          <p className='text-sm text-slate-400 font-medium uppercase tracking-wider mb-1'>{greeting()}</p>
          <h1 className='text-3xl font-extrabold text-slate-900'>
            Welcome back, <span className='text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500'>{currentUser.username}</span>
          </h1>
          <p className='text-slate-500 font-light mt-1'>Find your perfect workspace today.</p>
        </div>

        {/* Quick Actions */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-8'>
          <Link to='/search' className='bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all duration-300 group text-center'>
            <div className='w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300'>
              <FaSearch className='text-white text-sm' />
            </div>
            <p className='text-sm font-semibold text-slate-800'>Explore</p>
            <p className='text-[11px] text-slate-400'>Search workspaces</p>
          </Link>
          <Link to='/profile' className='bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all duration-300 group text-center'>
            <div className='w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300'>
              <FaCalendarCheck className='text-white text-sm' />
            </div>
            <p className='text-sm font-semibold text-slate-800'>Bookings</p>
            <p className='text-[11px] text-slate-400'>My reservations</p>
          </Link>
          <Link to='/about' className='bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all duration-300 group text-center'>
            <div className='w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300'>
              <FaCompass className='text-white text-sm' />
            </div>
            <p className='text-sm font-semibold text-slate-800'>About</p>
            <p className='text-[11px] text-slate-400'>Learn more</p>
          </Link>
          <Link to='/profile' className='bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all duration-300 group text-center'>
            <div className='w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300'>
              <FaRegBookmark className='text-white text-sm' />
            </div>
            <p className='text-sm font-semibold text-slate-800'>Profile</p>
            <p className='text-[11px] text-slate-400'>Account settings</p>
          </Link>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

          {/* Recent Workspaces */}
          <div className='lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6'>
            <div className='flex items-center justify-between mb-5'>
              <div>
                <h2 className='text-lg font-bold text-slate-900'>Latest Workspaces</h2>
                <p className='text-xs text-slate-400'>Recently added spaces</p>
              </div>
              <Link to='/search' className='text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors'>
                View All →
              </Link>
            </div>

            {loadingListings ? (
              <div className='flex items-center justify-center py-10'>
                <div className='w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin'></div>
              </div>
            ) : recentListings.length === 0 ? (
              <p className='text-sm text-slate-400 text-center py-10'>No workspaces available yet.</p>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {recentListings.map((listing) => (
                  <Link key={listing._id} to={`/listing/${listing._id}`} className='group'>
                    <div className='rounded-xl overflow-hidden border border-slate-100 hover:shadow-md transition-all duration-300'>
                      <div className='h-32 bg-slate-100 relative'>
                        <img
                          src={listing.imageUrls?.[0] || ''}
                          alt={listing.name}
                          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                        />
                        <span className='absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 uppercase tracking-wider'>
                          {listing.type === 'rent' ? 'Rent' : 'Sale'}
                        </span>
                      </div>
                      <div className='p-3'>
                        <p className='text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors'>{listing.name}</p>
                        <div className='flex items-center gap-1 mt-1'>
                          <FaMapMarkerAlt className='text-[10px] text-slate-300' />
                          <p className='text-[11px] text-slate-400 truncate'>{listing.address}</p>
                        </div>
                        <p className='text-sm font-bold text-slate-900 mt-2'>
                          {listing.offer ? listing.discountPrice?.toLocaleString('en-US') : listing.regularPrice?.toLocaleString('en-US')} DA
                          {listing.type === 'rent' && <span className='text-[10px] text-slate-400 font-normal'> /mo</span>}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className='flex flex-col gap-5'>

            {/* My Bookings Summary */}
            <div className='bg-white border border-slate-100 rounded-2xl p-6'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-bold text-slate-900'>My Bookings</h2>
                <Link to='/profile' className='text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors'>
                  See All →
                </Link>
              </div>

              {loadingBookings ? (
                <div className='flex items-center justify-center py-6'>
                  <div className='w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin'></div>
                </div>
              ) : bookedSpaces.length === 0 ? (
                <div className='text-center py-6'>
                  <FaCalendarCheck className='text-3xl text-slate-200 mx-auto mb-2' />
                  <p className='text-xs text-slate-400'>No bookings yet</p>
                  <Link to='/search' className='text-xs text-indigo-600 font-semibold hover:underline mt-1 inline-block'>Find a workspace</Link>
                </div>
              ) : (
                <div className='flex flex-col gap-3'>
                  {bookedSpaces.map((space) => (
                    <div key={space._id} className='flex items-center gap-3 bg-slate-50 rounded-xl px-3 py-2.5'>
                      <FaCalendarCheck className='text-indigo-500 text-sm flex-shrink-0' />
                      <div className='min-w-0'>
                        <p className='text-xs font-semibold text-slate-700 truncate'>{space.listing?.name || 'Workspace'}</p>
                        <p className='text-[10px] text-slate-400'>{new Date(space.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className='text-[9px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold ml-auto whitespace-nowrap'>
                        {space.status || 'Confirmed'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upgrade CTA */}
            {upgradeStatus !== 'approved' && (
              <div className='bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white'>
                <div className='flex items-center gap-2 mb-3'>
                  {upgradeStatus === 'pending' ? (
                    <FaClock className='text-amber-300' />
                  ) : (
                    <FaArrowUp className='text-indigo-200' />
                  )}
                  <h3 className='font-bold text-sm'>
                    {upgradeStatus === 'pending' ? 'Upgrade Pending' : 'Become a Seller'}
                  </h3>
                </div>
                <p className='text-indigo-100 text-xs leading-relaxed mb-4'>
                  {upgradeStatus === 'pending'
                    ? 'Your upgrade request is being reviewed by our team.'
                    : 'List your own workspaces and start earning. Upgrade your account to become a seller.'}
                </p>
                {upgradeStatus !== 'pending' && (
                  <Link to='/profile' className='inline-block bg-white text-indigo-700 font-semibold text-xs px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors'>
                    Apply Now
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
