import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AnimatedPage from '../../components/AnimatedPage';
import {
  FaPlus, FaChartLine, FaDoorOpen, FaEye, FaMapMarkerAlt,
  FaCalendarAlt, FaListUl, FaBath, FaUsers, FaEdit, FaTrash
} from 'react-icons/fa';
import CreateListingModal from '../../components/CreateListingModal';
import UpdateListingModal from '../../components/UpdateListingModal';
import toast from 'react-hot-toast';
import StatCard from '../../components/StatCard';
import AnalyticsChart from '../../components/AnalyticsChart';
import { FaWallet, FaClipboardCheck, FaBuilding, FaClock } from 'react-icons/fa';
import { useSocketContext } from '../../context/SocketContext';

export default function UserDashboard() {
  const { currentUser } = useSelector((state) => state.user);
  const { socket } = useSocketContext();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings');

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // New Analytics State
  const [ownerStats, setOwnerStats] = useState(null);
  const [range, setRange] = useState('month');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [listingToEdit, setListingToEdit] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data } = await axios.get(`/api/user/listings/${currentUser._id}`);
        if (Array.isArray(data)) {
          setListings(data);
        }
      } catch (err) {
        console.log('Could not fetch listings');
      } finally {
        setLoading(false);
      }
    };

    const fetchBookings = async () => {
      try {
        const { data } = await axios.get('/api/booking/owner');
        setBookings(data);
      } catch (err) {
        console.log('Error fetching bookings');
      } finally {
        setBookingsLoading(false);
      }
    };

    const fetchOwnerStats = async () => {
        try {
            const { data } = await axios.get('/api/stats/owner', { params: { range } });
            setOwnerStats(data);
        } catch (err) { console.log('Error fetching owner stats'); }
    }

    fetchListings();
    fetchBookings();
    fetchOwnerStats();
  }, [currentUser._id, range]);

  // Real-time updates for bookings
  useEffect(() => {
    if (socket) {
      socket.on('new_booking_request', (data) => {
        // Add newest booking to the top
        setBookings((prev) => [data.booking, ...prev]);
        
        // Update stats badge if ownerStats exists
        if (ownerStats) {
            const updatedCounts = [...(ownerStats.bookingStatusCounts || [])];
            const pendingIndex = updatedCounts.findIndex(s => s._id === 'pending');
            if (pendingIndex !== -1) {
                updatedCounts[pendingIndex].count += 1;
            } else {
                updatedCounts.push({ _id: 'pending', count: 1 });
            }
            setOwnerStats({ ...ownerStats, bookingStatusCounts: updatedCounts });
        }
      });

      return () => {
        socket.off('new_booking_request');
      };
    }
  }, [socket, ownerStats]);

  // Real-time stats updates when a booking status changes (e.g. approved by admin)
  useEffect(() => {
    if (socket) {
      socket.on('booking_status_updated', (data) => {
          // If the booking belongs to this owner, refresh stats
          if (data.booking.owner === currentUser._id) {
            const fetchOwnerStats = async () => {
                try {
                    const { data } = await axios.get('/api/stats/owner', { params: { range } });
                    setOwnerStats(data);
                } catch (err) { console.log('Error refreshing stats'); }
            };
            fetchOwnerStats();
            
            // Also update the local booking list if it's there
            setBookings(prev => prev.map(b => b._id === data.booking._id ? { ...b, status: data.booking.status } : b));
          }
      });

      return () => {
        socket.off('booking_status_updated');
      };
    }
  }, [socket, currentUser._id, range]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleListingDelete = async (listingId) => {
    try {
      const { data } = await axios.delete(`/api/listing/delete/${listingId}`);
      if (data.success === false) return toast.error(data.message);

      setListings((prev) => prev.filter((listing) => listing._id !== listingId));

      toast.success('Listing deleted!');
    } catch (error) {
      console.log(error.message);
      toast.error('Failed to delete listing');
    }
  };

  const handleUpdateListingSuccess = (updatedListing) => {
    setListings((prev) => prev.map((l) => l._id === updatedListing._id ? updatedListing : l));
  };

  const handleApproveBooking = async (id) => {
    try {
      await axios.put(`/api/booking/approve/${id}`);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'approved' } : b));
      
      // Refresh stats in real-time
      const { data } = await axios.get('/api/stats/owner', { params: { range } });
      setOwnerStats(data);
      
      toast.success('Booking approved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error approving booking');
    }
  };

  const handleRejectBooking = async (id) => {
    try {
      await axios.put(`/api/booking/reject/${id}`);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'rejected' } : b));
      
      // Refresh stats in real-time
      const { data } = await axios.get('/api/stats/owner', { params: { range } });
      setOwnerStats(data);
      
      toast.success('Booking rejected!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error rejecting booking');
    }
  };

  return (
    <AnimatedPage>
      <div className='min-h-screen pt-24 pb-10 px-4 max-w-6xl mx-auto'>

        {/* Welcome Header */}
        <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4'>
          <div>
            <p className='text-sm text-slate-400 font-medium uppercase tracking-wider mb-1'>{greeting()}</p>
            <h1 className='text-3xl font-extrabold text-slate-900'>
              Seller Dashboard
            </h1>
            <p className='text-slate-500 font-light mt-1'>Manage your workspace listings.</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className='flex items-center gap-2 bg-slate-900 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all duration-300 text-sm self-start sm:self-auto'
          >
            <FaPlus className='text-xs' />
            Create Listing
          </button>
        </div>

        {/* New Analytics Section */}
        <div className='mb-12'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-bold text-slate-900 flex items-center gap-2'>
              <FaChartLine className='text-indigo-600' /> Financial Analytics
            </h2>
            <select 
               value={range} 
               onChange={(e) => setRange(e.target.value)}
               className='text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none cursor-pointer'
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
             <StatCard 
                title="Total Revenue" 
                value={`${ownerStats?.totalIncome?.toLocaleString() || 0} DA`} 
                icon={FaWallet} 
                colorClass="bg-indigo-600"
             />
             <StatCard 
                title="Active Listings" 
                value={ownerStats?.inventoryStats?.reduce((acc, curr) => acc + curr.count, 0) || listings.length} 
                icon={FaBuilding} 
                colorClass="bg-slate-900" 
             />
             <StatCard 
                title="Approved Bookings" 
                value={ownerStats?.bookingStatusCounts?.find(s => s._id === 'approved')?.count || 0} 
                icon={FaClipboardCheck} 
                colorClass="bg-emerald-600" 
             />
             <StatCard 
                title="Pending Requests" 
                value={ownerStats?.bookingStatusCounts?.find(s => s._id === 'pending')?.count || 0} 
                icon={FaClock} 
                colorClass="bg-amber-500" 
             />
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-1 gap-6 h-[400px]'>
             <AnalyticsChart 
                data={ownerStats?.revenueStats || []} 
                title="Income Trend" 
                dataKey="income" 
                color="#4f46e5"
             />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-8 mt-4 gap-6">
          <button onClick={() => setActiveTab('listings')} className={`pb-3 font-semibold text-sm transition-all relative ${activeTab === 'listings' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
            My Listings
            {activeTab === 'listings' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-900"></span>}
          </button>
          <button onClick={() => setActiveTab('bookings')} className={`pb-3 font-semibold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'bookings' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
            Booking Requests
            {bookings.filter(b => b.status === 'pending').length > 0 && (
              <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold px-1.5">{bookings.filter(b => b.status === 'pending').length}</span>
            )}
            {activeTab === 'bookings' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-900"></span>}
          </button>
        </div>

        {activeTab === 'listings' ? (
          <div className='bg-white border border-slate-100 rounded-2xl overflow-hidden'>
            <div className='px-6 py-5 border-b border-slate-100 flex items-center justify-between'>
              <div>
                <h2 className='text-lg font-bold text-slate-900'>My Listings</h2>
                <p className='text-xs text-slate-400'>All your published workspaces</p>
              </div>
            </div>

            {loading ? (
              <div className='flex items-center justify-center py-16'>
                <div className='w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin'></div>
              </div>
            ) : listings.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-16 text-center'>
                <div className='w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4'>
                  <FaDoorOpen className='text-slate-300 text-2xl' />
                </div>
                <p className='text-sm font-semibold text-slate-700 mb-1'>No listings yet</p>
                <p className='text-xs text-slate-400 mb-4'>Create your first workspace listing to get started.</p>
                <button onClick={() => setIsCreateModalOpen(true)} className='text-xs bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors font-medium'>
                  Create Now
                </button>
              </div>
            ) : (
              <div className='divide-y divide-slate-50'>
                {listings.map((listing) => (
                  <div key={listing._id} className='flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors group'>

                    {/* Listing clickable info */}
                    <Link to={`/listing/${listing._id}`} className='flex flex-1 items-center gap-4 min-w-0'>
                      <img
                        src={listing.imageUrls?.[0] || ''}
                        alt={listing.name}
                        className='w-16 h-12 rounded-lg object-cover bg-slate-100 flex-shrink-0'
                      />
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors'>{listing.name}</p>
                        <div className='flex items-center gap-1 mt-0.5'>
                          <FaMapMarkerAlt className='text-[9px] text-slate-300' />
                          <p className='text-[11px] text-slate-400 truncate'>{listing.address}</p>
                        </div>
                      </div>
                    </Link>

                    {/* Pricing / Type */}
                    <div className='hidden md:block text-right flex-shrink-0'>
                      <p className='text-sm font-bold text-slate-900'>
                        {listing.offer ? listing.discountPrice?.toLocaleString('en-US') : listing.regularPrice?.toLocaleString('en-US')} DA
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        listing.category === 'service' ? 'bg-amber-50 text-amber-600' :
                        listing.type === 'rent' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {listing.category === 'service' ? 'Service' : listing.type}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex items-center justify-end gap-2 flex-shrink-0 mt-2 sm:mt-0'>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setListingToEdit(listing);
                          setIsUpdateModalOpen(true);
                        }}
                        className='p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors'
                        title='Edit Listing'
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (window.confirm("Are you sure you want to delete this listing?")) {
                            handleListingDelete(listing._id);
                          }
                        }}
                        className='p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                        title='Delete Listing'
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className='bg-white border border-slate-100 rounded-2xl overflow-hidden'>
            <div className='px-6 py-5 border-b border-slate-100 flex items-center justify-between'>
              <div>
                <h2 className='text-lg font-bold text-slate-900'>Client Bookings</h2>
                <p className='text-xs text-slate-400'>Review and manage workspace requests</p>
              </div>
            </div>
            {bookingsLoading ? (
              <div className='flex items-center justify-center py-16'><div className='w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin'></div></div>
            ) : bookings.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-16 text-center text-slate-400'><p>No bookings received yet.</p></div>
            ) : (
              <div className='divide-y divide-slate-50'>
                {bookings.map((booking) => (
                  <div key={booking._id} className='flex flex-col md:flex-row gap-4 px-6 py-5 hover:bg-slate-50/50 transition-colors'>
                    <div className='flex items-center gap-4 md:w-1/3'>
                      <img src={booking.user?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} className='w-12 h-12 rounded-full object-cover border border-slate-200' />
                      <div>
                        <p className='text-sm font-bold text-slate-900'>{booking.user?.username}</p>
                        <p className='text-xs text-slate-500'>{booking.user?.email}</p>
                        <p className='text-[10px] text-slate-400 mt-1'>{new Date(booking.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className='md:w-1/3 flex flex-col justify-center'>
                      <Link to={`/listing/${booking.listing?._id}`} className='text-sm font-bold text-indigo-600 hover:underline truncate'>{booking.listing?.name}</Link>
                      <div className='mt-1 text-xs text-slate-500'>
                        <p className="font-semibold text-slate-800">Total: {booking.finalPrice} DA</p>
                        {booking.features?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {booking.features.map((f, i) => <span key={i} className="bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded-full">{f}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className='md:w-1/3 flex items-center justify-between md:justify-end gap-3'>
                      {booking.status === 'pending' ? (
                        <div className="flex gap-2 w-full md:w-auto">
                          <button onClick={() => handleApproveBooking(booking._id)} className="flex-1 md:flex-none bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-emerald-600">Approve</button>
                          <button onClick={() => handleRejectBooking(booking._id)} className="flex-1 md:flex-none bg-white border border-red-200 text-red-500 text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-50">Reject</button>
                        </div>
                      ) : (
                        <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${booking.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {booking.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <CreateListingModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <UpdateListingModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} listing={listingToEdit} onUpdateSuccess={handleUpdateListingSuccess} />
    </AnimatedPage>
  );
}
