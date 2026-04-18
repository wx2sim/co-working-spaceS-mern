import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { useSelector } from 'react-redux';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css/bundle';
import 'swiper/css/pagination';
import {
  FaBath,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaDoorOpen,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaTag,
  FaArrowLeft,
  FaRegCopy,
  FaStar,
} from 'react-icons/fa';
import Contact from '../components/Contact';
import AnimatedPage from '../components/AnimatedPage';

export default function Listing() {
  SwiperCore.use([Navigation, Pagination]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingFeatures, setBookingFeatures] = useState({
    catering: false,
    projector: false,
    extraChairs: false,
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [bookingDate, setBookingDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]);

  const availableRooms = listing?.availableRooms !== undefined ? listing.availableRooms : listing?.rooms;
  const isFullyBooked = availableRooms <= 0;
  const basePrice = listing?.offer ? listing.discountPrice : listing?.regularPrice;

  const calculateFinalPrice = () => {
    let price = +basePrice || 0;
    if (bookingFeatures.catering) price += 50;
    if (bookingFeatures.projector) price += 20;
    if (bookingFeatures.extraChairs) price += 10;
    return price;
  };

  const handleBookSpaceClick = () => {
    if (!currentUser) {
      navigate('/signup');
      return;
    }
    if (!currentUser.isVerified) {
      return toast.error('Please verify your email first!', { icon: '✉️' });
    }
    setShowBookingModal(true);
  };

  const handleValidateBooking = async () => {
    try {
      setBookingLoading(true);
      const selectedFeatures = [];
      if (bookingFeatures.catering) selectedFeatures.push("Catering (+50 DA)");
      if (bookingFeatures.projector) selectedFeatures.push("Projector (+20 DA)");
      if (bookingFeatures.extraChairs) selectedFeatures.push("Extra Chairs (+10 DA)");

      const payload = {
        listingId: listing._id,
        features: selectedFeatures,
        finalPrice: calculateFinalPrice(),
        paymentMethod: 'cash',
        bookingDate
      };
      
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/booking/create`, payload);
      setBookingSuccess(true);
      setBookingLoading(false);
      
      if (listing.availableRooms !== undefined) {
         setListing({...listing, availableRooms: listing.availableRooms - 1});
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to process booking';
      toast.error(message);
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/listing/get/${params.listingId}`);
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
        setError(false);
      } catch (err) {
        const statusCode = err.response?.status || 500;
        const message = err.response?.data?.message || 'Something went wrong loading this listing.';
        navigate(`/error/${statusCode}?message=${encodeURIComponent(message)}`, { replace: true });
      }
    };

    const fetchUserRating = async () => {
      if (!currentUser) return;
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/rating/get/${params.listingId}`);
        if (data) setUserRating(data.rating);
      } catch (err) { console.log(err); }
    };

    fetchListing();
    fetchUserRating();
  }, [params.listingId, currentUser]);

  const handleRatingSubmit = async (newRating) => {
    if (!currentUser) {
      navigate('/signup');
      return;
    }
    try {
      setRatingLoading(true);
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/rating/add`, {
        listingId: listing._id,
        rating: newRating
      });
      setUserRating(newRating);
      setListing(data); // update averageRating and ratingCount
      toast.success('Thank you for rating!');
    } catch (err) {
      toast.error('Failed to save rating');
    } finally {
      setRatingLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatedPage>
      <div className='min-h-screen pt-20 pb-4 px-4 max-w-6xl mx-auto'>

        {/* Loading State */}
        {loading && (
          <div className='flex flex-col items-center justify-center py-32'>
            <div className='w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4'></div>
            <p className='text-slate-500 font-light text-lg'>Loading workspace details...</p>
          </div>
        )}


        {/* Error State - fallback for data.success === false */}
        {error && (
          <div className='flex flex-col items-center justify-center py-32'>
            <p className='text-slate-500 font-light text-lg'>Could not load this listing.</p>
            <Link to='/search' className='mt-4 text-sm text-slate-900 font-semibold hover:underline'>
              Back to Search
            </Link>
          </div>
        )}

        {/* Main Content */}
        {listing && !loading && !error && (
          <>
            {/* Back & Share Row */}
            <div className='flex items-center justify-between mb-3'>
              <Link
                to='/search'
                className='flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors duration-300 group'
              >
                <FaArrowLeft className='text-xs group-hover:-translate-x-1 transition-transform duration-300' />
                Back to Workspaces
              </Link>
              <button
                onClick={handleCopyLink}
                className='flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium text-xs transition-colors duration-300 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md'
              >
                <FaRegCopy className='text-xs' />
                {copied ? 'Copied!' : 'Share'}
              </button>
            </div>

            {/* Main Card */}
            <div className='bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col lg:flex-row'>

              {/* Left — Image Gallery */}
              <div className='w-full lg:w-1/2 relative'>
                <Swiper
                  navigation
                  pagination={{ clickable: true }}
                  onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
                  className='h-[280px] sm:h-[320px] lg:h-full listing-swiper'
                >
                  {listing.imageUrls.map((url) => (
                    <SwiperSlide key={url}>
                      <div
                        className='h-full w-full'
                        style={{
                          background: `url(${url}) center no-repeat`,
                          backgroundSize: 'cover',
                        }}
                      ></div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Image Counter Pill */}
                <div className='absolute bottom-3 left-3 z-10 bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-full'>
                  {activeImageIndex + 1} / {listing.imageUrls.length}
                </div>

                {/* Type Badge */}
                <div className='absolute top-3 left-3 z-10 flex gap-2'>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg ${
                    listing.category === 'service' ? 'bg-amber-500 text-white' :
                    listing.type === 'rent' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {listing.category === 'service' ? 'Service' : (listing.type === 'rent' ? 'For Rent' : 'For Sale')}
                  </span>
                  {isFullyBooked && (
                    <span className='text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg bg-red-600 text-white'>
                      Fully Booked
                    </span>
                  )}
                </div>

                {/* Offer Badge */}
                {listing.offer && (
                  <div className='absolute top-3 right-3 z-10'>
                    <span className='text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-white uppercase tracking-wider shadow-lg flex items-center gap-1'>
                      <FaTag className='text-[9px]' />
                      {(+listing.regularPrice - +listing.discountPrice).toLocaleString('en-US')} DA OFF
                    </span>
                  </div>
                )}
              </div>

              {/* Vertical Divider */}
              <div className='hidden lg:block w-px bg-slate-100 my-6'></div>

              {/* Right — Details */}
              <div className='w-full lg:w-1/2 p-5 sm:p-6 flex flex-col'>

                {/* Title & Price */}
                <div className='mb-3'>
                  <h1 className='text-2xl font-extrabold text-slate-900 mb-1.5 leading-tight'>
                    {listing.name}
                  </h1>
                  <div className='flex items-baseline gap-2 mb-2'>
                    <span className='text-2xl font-extrabold text-slate-900'>
                      {listing.offer
                        ? listing.discountPrice.toLocaleString('en-US')
                        : listing.regularPrice.toLocaleString('en-US')} DA
                    </span>
                    {listing.category === 'property' && listing.type === 'rent' && (
                      <span className='text-xs text-slate-400 font-medium'>/ month</span>
                    )}
                    {listing.category === 'service' && (
                      <span className='text-xs text-slate-400 font-medium'>/ Total Service</span>
                    )}
                    {listing.offer && (
                      <span className='text-xs text-slate-400 line-through font-medium'>
                        {listing.regularPrice.toLocaleString('en-US')} DA
                      </span>
                    )}
                  </div>
                  <div className='flex items-center gap-3 mb-2'>
                    <div className='flex items-center gap-1.5 text-slate-500 text-xs'>
                      <FaMapMarkerAlt className='text-slate-400 flex-shrink-0 text-[11px]' />
                      <span>{listing.address}</span>
                    </div>
                    <div className='w-px h-3 bg-slate-200'></div>
                    <div className='flex items-center gap-1 text-amber-500'>
                      <FaStar className='text-[10px]' />
                      <span className='text-xs font-bold'>
                        {listing.ratingCount > 0 ? listing.averageRating : 'N/A'}
                      </span>
                      <span className='text-[10px] text-slate-400 font-medium ml-0.5'>
                        ({listing.ratingCount || 0})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating Input for Logged In Users */}
                {currentUser && (
                  <div className='mb-4 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl'>
                    <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2'>Rate your experience</p>
                    <div className='flex items-center gap-2'>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRatingSubmit(star)}
                          disabled={ratingLoading}
                          className='transition-all duration-200 hover:scale-110 disabled:opacity-50'
                        >
                          <FaStar 
                            className={`text-lg ${star <= userRating ? 'text-amber-500' : 'text-slate-200'}`} 
                          />
                        </button>
                      ))}
                      {userRating > 0 && (
                        <span className='text-[10px] font-bold text-emerald-600 ml-2'>You rated {userRating}/5</span>
                      )}
                    </div>
                  </div>
                )}
                {!currentUser && (
                  <div className='mb-4 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl'>
                    <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>Experience this space?</p>
                    <Link to='/signup' className='text-xs font-bold text-indigo-600 hover:underline'>Sign in to leave a rating</Link>
                  </div>
                )}

                {/* Divider */}
                <div className='border-t border-slate-100'></div>

                {/* Description */}
                <div className='my-3'>
                  <h2 className='text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5'>
                    About this Space
                  </h2>
                  <p className='text-slate-600 text-xs leading-relaxed font-light line-clamp-3'>
                    {listing.description}
                  </p>
                </div>

                {/* Divider */}
                <div className='border-t border-slate-100'></div>

                {/* Amenities — Compact Grid */}
                {listing.category === 'property' && (
                  <div className='my-3'>
                    <h2 className='text-xs font-bold text-slate-900 uppercase tracking-wider mb-2'>
                      Amenities
                    </h2>
                    <div className='grid grid-cols-3 gap-2'>
                      <div className='flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-2'>
                        <FaDoorOpen className='text-slate-500 text-xs flex-shrink-0' />
                        <div className='min-w-0'>
                          <p className='text-[10px] text-slate-400 leading-tight'>Rooms</p>
                          <p className='text-xs font-bold text-slate-800'>{listing.rooms}</p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-2'>
                        <FaUsers className='text-slate-500 text-xs flex-shrink-0' />
                        <div className='min-w-0'>
                          <p className='text-[10px] text-slate-400 leading-tight'>Conference</p>
                          <p className='text-xs font-bold text-slate-800'>{listing.confirencerooms}</p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-2'>
                        <FaBath className='text-slate-500 text-xs flex-shrink-0' />
                        <div className='min-w-0'>
                          <p className='text-[10px] text-slate-400 leading-tight'>Baths</p>
                          <p className='text-xs font-bold text-slate-800'>{listing.bathrooms}</p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-2'>
                        <FaParking className='text-slate-500 text-xs flex-shrink-0' />
                        <div className='min-w-0'>
                          <p className='text-[10px] text-slate-400 leading-tight'>Parking</p>
                          <p className='text-xs font-bold text-slate-800 flex items-center gap-0.5'>
                            {listing.parking ? (
                              <><FaCheckCircle className='text-emerald-500 text-[10px]' /> Yes</>
                            ) : (
                              <><FaTimesCircle className='text-red-400 text-[10px]' /> No</>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-2 col-span-2'>
                        <FaChair className='text-slate-500 text-xs flex-shrink-0' />
                        <div className='min-w-0'>
                          <p className='text-[10px] text-slate-400 leading-tight'>Furnishing</p>
                          <p className='text-xs font-bold text-slate-800 flex items-center gap-0.5'>
                            {listing.furnished ? (
                              <><FaCheckCircle className='text-emerald-500 text-[10px]' /> Furnished</>
                            ) : (
                              <><FaTimesCircle className='text-red-400 text-[10px]' /> Unfurnished</>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {listing.category === 'service' && (
                  <div className='my-3'>
                    <h2 className='text-xs font-bold text-slate-900 uppercase tracking-wider mb-2'>
                      Service Features
                    </h2>
                    <div className='grid grid-cols-1 gap-2'>
                      <div className='flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3'>
                        <FaCheckCircle className='text-indigo-500 text-sm' />
                        <p className='text-sm font-semibold text-slate-700'>Professional Service Offered</p>
                      </div>
                      <div className='flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3'>
                        <FaCheckCircle className='text-indigo-500 text-sm' />
                        <p className='text-sm font-semibold text-slate-700'>Co-working Integrated Solution</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Spacer */}
                <div className='flex-grow'></div>

                {/* Contact CTA */}
                <div className='pt-3 border-t border-slate-100 flex flex-wrap gap-2 w-full'>
                  {currentUser && listing.userRef !== currentUser._id && !contact && (
                    <button
                      onClick={() => {
                        if (!currentUser.isVerified) return toast.error('Please verify your email first!');
                        setContact(true);
                      }}
                      className={`flex-1 min-w-[140px] bg-white border-[1.5px] border-slate-900 text-slate-900 font-bold py-2.5 px-4 rounded-xl transition-all duration-300 text-sm ${!currentUser.isVerified ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
                    >
                      Message Owner
                    </button>
                  )}
                  {(!currentUser || listing.userRef !== currentUser._id) && !contact && (
                    <button
                      onClick={handleBookSpaceClick}
                      disabled={listing.category === 'property' && isFullyBooked}
                      className={`flex-1 min-w-[140px] font-bold py-2.5 px-4 rounded-xl transition-all duration-300 text-sm ${listing.category === 'property' && isFullyBooked ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-inner' : ( !currentUser?.isVerified ? 'bg-slate-900 text-white opacity-50 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md')}`}
                    >
                      {listing.category === 'property' && isFullyBooked ? 'Fully Booked' : (listing.category === 'service' ? 'Order Service' : 'Book Space')}
                    </button>
                  )}

                  {contact && (
                    <div className='w-full bg-slate-50 border border-slate-100 rounded-xl p-4'>
                      <Contact listing={listing} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Book Workspace</h3>
                <p className="text-xs text-slate-500">Customize your reservation</p>
              </div>
              <button disabled={bookingSuccess} onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-red-500 bg-slate-100 p-2 rounded-full transition-colors">
                <FaTimesCircle size={20} />
              </button>
            </div>
            
            <div className="p-6">
                  {bookingSuccess ? (
                    <div className="flex flex-col items-center justify-center text-center py-6">
                      <FaCheckCircle className="text-emerald-500 text-6xl mb-4 animate-bounce" />
                      <h4 className="text-xl font-bold text-slate-900 mb-2">{listing.category === 'service' ? 'Order Placed!' : 'Booking Validated!'}</h4>
                      <p className="text-sm text-slate-500 px-4">{listing.category === 'service' ? 'The service provider will contact you shortly to complete the process.' : 'The space owner will contact you shortly to complete the remaining process.'}</p>
                      <button onClick={() => setShowBookingModal(false)} className="mt-8 w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-md">
                        Done
                      </button>
                    </div>
                  ) : (
                    <>
                       <div className="mb-6">
                         <label className="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wider">Select Date</label>
                         <input 
                            type="date"
                            min={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                         />
                       </div>

                       {listing.category === 'property' ? (
                          <div className="mb-4">
                            <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Optional Features</h4>
                            <label className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl mb-2.5 cursor-pointer hover:bg-slate-50 transition-colors">
                              <span className="text-sm font-semibold text-slate-700">Catering Service (+50 DA)</span>
                              <input type="checkbox" className="accent-slate-900 w-4 h-4 shadow-sm" checked={bookingFeatures.catering} onChange={(e) => setBookingFeatures({...bookingFeatures, catering: e.target.checked})} />
                            </label>
                            <label className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl mb-2.5 cursor-pointer hover:bg-slate-50 transition-colors">
                              <span className="text-sm font-semibold text-slate-700">Projector Setup (+20 DA)</span>
                              <input type="checkbox" className="accent-slate-900 w-4 h-4 shadow-sm" checked={bookingFeatures.projector} onChange={(e) => setBookingFeatures({...bookingFeatures, projector: e.target.checked})} />
                            </label>
                            <label className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl mb-2.5 cursor-pointer hover:bg-slate-50 transition-colors">
                              <span className="text-sm font-semibold text-slate-700">Extra Chairs (+10 DA)</span>
                              <input type="checkbox" className="accent-slate-900 w-4 h-4 shadow-sm" checked={bookingFeatures.extraChairs} onChange={(e) => setBookingFeatures({...bookingFeatures, extraChairs: e.target.checked})} />
                            </label>
                          </div>
                       ) : (
                          <div className="mb-4 text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                             <p className="text-sm text-slate-500 italic">No additional options for this service.</p>
                          </div>
                       )}
                   
                   <div className="flex justify-between items-center py-5 border-t border-slate-100 mb-4 bg-slate-50 -mx-6 px-6 shadow-inner">
                     <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Final Total</span>
                     <span className="text-3xl font-extrabold text-slate-900">{calculateFinalPrice()} DA</span>
                   </div>
                   
                   <div className="flex flex-col gap-3">
                      <button disabled={bookingLoading} onClick={handleValidateBooking} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
                        {bookingLoading ? 'Processing...' : (listing.category === 'service' ? 'Confirm Order' : 'Validate Booking (Cash)')}
                      </button>
                     <button disabled className="w-full flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-400 font-bold py-3.5 rounded-xl cursor-not-allowed">
                       Pay with Stripe <span className="text-[10px] bg-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-widest text-indigo-500">Coming Soon</span>
                     </button>
                   </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
}