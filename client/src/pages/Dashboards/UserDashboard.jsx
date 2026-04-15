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

export default function UserDashboard() {
  const { currentUser } = useSelector((state) => state.user);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, forRent: 0, forSale: 0, withOffer: 0 });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [listingToEdit, setListingToEdit] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data } = await axios.get(`/api/user/listings/${currentUser._id}`);
        if (Array.isArray(data)) {
          setListings(data);
          setStats({
            total: data.length,
            forRent: data.filter(l => l.type === 'rent').length,
            forSale: data.filter(l => l.type === 'sale').length,
            withOffer: data.filter(l => l.offer).length,
          });
        }
      } catch (err) {
        console.log('Could not fetch listings');
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [currentUser._id]);

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
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: prev.total - 1
      }));
      
      toast.success('Listing deleted!');
    } catch (error) {
      console.log(error.message);
      toast.error('Failed to delete listing');
    }
  };

  const handleUpdateListingSuccess = (updatedListing) => {
    setListings((prev) => prev.map((l) => l._id === updatedListing._id ? updatedListing : l));
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

        {/* Stats Row */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
          <div className='bg-white border border-slate-100 rounded-2xl p-5'>
            <div className='flex items-center justify-between mb-3'>
              <div className='w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center'>
                <FaListUl className='text-white text-sm' />
              </div>
              <span className='text-2xl font-extrabold text-slate-900'>{stats.total}</span>
            </div>
            <p className='text-xs text-slate-400 font-medium'>Total Listings</p>
          </div>
          <div className='bg-white border border-slate-100 rounded-2xl p-5'>
            <div className='flex items-center justify-between mb-3'>
              <div className='w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center'>
                <FaCalendarAlt className='text-white text-sm' />
              </div>
              <span className='text-2xl font-extrabold text-slate-900'>{stats.forRent}</span>
            </div>
            <p className='text-xs text-slate-400 font-medium'>For Rent</p>
          </div>
          <div className='bg-white border border-slate-100 rounded-2xl p-5'>
            <div className='flex items-center justify-between mb-3'>
              <div className='w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center'>
                <FaChartLine className='text-white text-sm' />
              </div>
              <span className='text-2xl font-extrabold text-slate-900'>{stats.forSale}</span>
            </div>
            <p className='text-xs text-slate-400 font-medium'>For Sale</p>
          </div>
          <div className='bg-white border border-slate-100 rounded-2xl p-5'>
            <div className='flex items-center justify-between mb-3'>
              <div className='w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center'>
                <FaEye className='text-white text-sm' />
              </div>
              <span className='text-2xl font-extrabold text-slate-900'>{stats.withOffer}</span>
            </div>
            <p className='text-xs text-slate-400 font-medium'>With Offers</p>
          </div>
        </div>

        {/* Listings Table */}
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
                      ${listing.offer ? listing.discountPrice?.toLocaleString('en-US') : listing.regularPrice?.toLocaleString('en-US')}
                    </p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      listing.type === 'rent' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {listing.type}
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
      </div>

      <CreateListingModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <UpdateListingModal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} listing={listingToEdit} onUpdateSuccess={handleUpdateListingSuccess} />
    </AnimatedPage>
  );
}
