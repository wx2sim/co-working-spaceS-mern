import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectFade } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import { FaSearch, FaMapMarkerAlt, FaStar, FaArrowRight, FaCity, FaWifi, FaCoffee } from 'react-icons/fa';
import AnimatedPage from '../components/AnimatedPage';
import ListingItem from '../components/ListingItem';

export default function Home() {
  SwiperCore.use([Navigation, Autoplay, EffectFade]);
  const [offerListings, setOfferListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [providers, setProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        const res = await axios.get('/api/listing/get?offer=true&limit=4');
        setOfferListings(res.data);
        fetchRentListings();
      } catch (error) {
        console.log(error);
      }
    };
    const fetchRentListings = async () => {
      try {
        const res = await axios.get('/api/listing/get?type=rent&limit=4');
        setRentListings(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    const fetchReviews = async () => {
      try {
        const res = await axios.get('/api/review/get');
        setReviews(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    const fetchProviders = async () => {
      try {
        const res = await axios.get('/api/user/top-providers');
        setProviders(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchOfferListings();
    fetchReviews();
    fetchProviders();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  return (
    <AnimatedPage>
      <div className='min-h-screen bg-transparent'>

        {/* HERO SECTION */}
        <div className='relative h-[650px] md:h-[750px] flex items-center justify-center overflow-hidden'>
          {/* Background Images Swiper */}
          <div className='absolute inset-0 z-0'>
            <Swiper
              modules={[Autoplay, EffectFade]}
              effect='fade'
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              loop={true}
              allowTouchMove={false}
              className='h-full w-full'
            >
              {[
                'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2000&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2000&auto=format&fit=crop'
              ].map((img, idx) => (
                <SwiperSlide key={idx} className='h-full'>
                  <img src={img} alt='Hero background' className='w-full h-full object-cover scale-105 transform origin-center animate-pulse-slow' />
                  <div className='absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90 mix-blend-multiply'></div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Hero Content */}
          <div className='relative z-10 w-full max-w-5xl mx-auto px-4 text-center pb-20'>
            <span className='inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold tracking-wider uppercase mb-6'>
              Inspiring Workspaces
            </span>
            <h1 className='text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight'>
              Find your next <br className='hidden md:block' />
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300'>creative environment</span>.
            </h1>
            <p className='text-slate-300 text-lg sm:text-xl font-light mb-10 max-w-2xl mx-auto leading-relaxed'>
              Discover premium co-working spaces, private offices, and meeting rooms tailored for innovators and fast-growing teams.
            </p>

            {/* Smart Search Bar */}
            <form onSubmit={handleSearchSubmit} className='max-w-3xl mx-auto relative group'>
              <div className='absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300'></div>
              <div className='relative flex items-center bg-white rounded-2xl p-2 shadow-2xl'>
                <div className='pl-4 text-slate-400'>
                  <FaSearch size={20} />
                </div>
                <input
                  type='text'
                  placeholder='Search by city, neighborhood, or workspace name...'
                  className='flex-1 bg-transparent px-4 py-4 text-slate-700 focus:outline-none text-form'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type='submit'
                  className='bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-md hidden sm:block'
                >
                  Explore
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className='max-w-6xl mx-auto px-4 py-20'>

          {/* Value Props */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 -mt-32 relative z-20'>
            <div className='bg-white rounded-2xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 transform hover:-translate-y-2 transition-transform duration-300'>
              <div className='w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 text-indigo-600'>
                <FaCity size={24} />
              </div>
              <h3 className='text-xl font-bold text-slate-900 mb-3'>Prime Locations</h3>
              <p className='text-slate-500 leading-relaxed font-light text-sm'>Access the most sought-after business districts and creative hubs globally.</p>
            </div>
            <div className='bg-white rounded-2xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 transform hover:-translate-y-2 transition-transform duration-300 delay-100'>
              <div className='w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-600'>
                <FaWifi size={24} />
              </div>
              <h3 className='text-xl font-bold text-slate-900 mb-3'>Ultra Fast Internet</h3>
              <p className='text-slate-500 leading-relaxed font-light text-sm'>Enterprise-grade networking routing ensures you are always connected.</p>
            </div>
            <div className='bg-white rounded-2xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 transform hover:-translate-y-2 transition-transform duration-300 delay-200'>
              <div className='w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6 text-amber-600'>
                <FaCoffee size={24} />
              </div>
              <h3 className='text-xl font-bold text-slate-900 mb-3'>Premium Amenities</h3>
              <p className='text-slate-500 leading-relaxed font-light text-sm'>Enjoy artisan coffee, ergonomic seating, and wellness rooms included.</p>
            </div>
          </div>

          {/* Featured Offers */}
          {offerListings && offerListings.length > 0 && (
            <div className='mb-24'>
              <div className='flex items-end justify-between mb-8'>
                <div>
                  <h2 className='text-3xl font-extrabold text-slate-900 mb-2'>Special Offers</h2>
                  <p className='text-slate-500'>Limited time deals on premium spaces.</p>
                </div>
                <Link to='/search?offer=true' className='text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center gap-2 transition-colors'>
                  See all <FaArrowRight />
                </Link>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
                {offerListings.map((listing) => (
                  <ListingItem key={listing._id} listing={listing} />
                ))}
              </div>
            </div>
          )}

          {/* Top Rated Rent */}
          {rentListings && rentListings.length > 0 && (
            <div className='mb-24'>
              <div className='flex items-end justify-between mb-8'>
                <div>
                  <h2 className='text-3xl font-extrabold text-slate-900 mb-2'>Top Rated for Rent</h2>
                  <p className='text-slate-500'>The most loved workspaces by our community.</p>
                </div>
                <Link to='/search?type=rent' className='text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center gap-2 transition-colors'>
                  See all <FaArrowRight />
                </Link>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
                {rentListings.map((listing) => (
                  <ListingItem key={listing._id} listing={listing} />
                ))}
              </div>
            </div>
          )}

          {/* Top Service Providers */}
          {providers && providers.length > 0 && (
            <div className='mb-24'>
              <div className='flex items-end justify-between mb-8'>
                <div>
                  <h2 className='text-3xl font-extrabold text-slate-900 mb-2'>Top Workspace Providers</h2>
                  <p className='text-slate-500'>Ranked by listings, community activity, and trust.</p>
                </div>
              </div>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6'>
                {providers.map((provider) => (
                  <div key={provider._id} className='bg-white border border-slate-100 rounded-3xl p-6 text-center hover:shadow-xl hover:shadow-indigo-500/10 transition-all group'>
                    <div className='relative inline-block mb-4'>
                      <img 
                        src={provider.avatar} 
                        alt={provider.username} 
                        className='w-20 h-20 rounded-2xl object-cover border-4 border-slate-50 group-hover:border-indigo-100 transition-colors mx-auto shadow-md' 
                      />
                      <div className='absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm'>
                        TOP
                      </div>
                    </div>
                    <h4 className='text-sm font-bold text-slate-800 mb-1 truncate'>{provider.username}</h4>
                    <p className='text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3'>Space Provider</p>
                    
                    <div className='flex items-center justify-center gap-3 pt-3 border-t border-slate-50'>
                      <div className='text-center'>
                        <p className='text-[10px] font-bold text-slate-700'>{provider.listingCount}</p>
                        <p className='text-[8px] text-slate-400'>Listings</p>
                      </div>
                      <div className='w-px h-4 bg-slate-100'></div>
                      <div className='text-center'>
                        <p className='text-[10px] font-bold text-indigo-600'>{provider.activityScore}</p>
                        <p className='text-[8px] text-slate-400'>Activity</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Community Reviews Section - Breaking the pattern */}
        <div className='bg-slate-950 py-24 relative overflow-hidden'>
          <div className='absolute inset-0 opacity-20'>
            <div className='absolute top-0 -left-1/4 w-1/2 h-[500px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[150px] animate-pulse-slow'></div>
            <div className='absolute bottom-0 -right-1/4 w-1/2 h-[500px] bg-cyan-600 rounded-full mix-blend-screen filter blur-[150px] animate-pulse-slow' style={{animationDelay: '2s'}}></div>
          </div>
          
          <div className='max-w-6xl mx-auto px-4 relative z-10'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl md:text-5xl font-extrabold text-white mb-4'>Why our community loves us</h2>
              <p className='text-slate-400 max-w-2xl mx-auto text-lg'>Hear from freelancers, startups, and enterprises who found their perfect workspace.</p>
            </div>

            <div className='mt-8'>
              <Swiper
                modules={[Autoplay, Navigation]}
                spaceBetween={30}
                slidesPerView={1}
                navigation
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                loop={reviews.length > 3}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 }
                }}
                className='pb-12'
              >
                {reviews.length === 0 ? (
                  // Fallback to placeholders if no reviews in DB
                  [1, 2, 3].map((i) => (
                    <SwiperSlide key={i}>
                      <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full'>
                        <div className='flex gap-1 text-amber-400 mb-6'>
                          <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                        </div>
                        <p className='text-slate-300 text-sm leading-relaxed mb-8 font-light italic'>
                          "Loading wonderful community stories..."
                        </p>
                        <div className='flex items-center gap-4'>
                          <div className='w-12 h-12 rounded-full bg-slate-800' />
                          <div>
                            <h4 className='text-white font-bold text-sm'>Community Member</h4>
                            <p className='text-slate-500 text-[10px] uppercase tracking-wider font-bold'>Member</p>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))
                ) : (
                  reviews.map((review) => (
                    <SwiperSlide key={review._id}>
                      <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all h-full group'>
                        <div className='flex gap-1 text-amber-400 mb-6'>
                          {[...Array(review.rating)].map((_, i) => <FaStar key={i} />)}
                        </div>
                        <p className='text-slate-300 text-sm leading-relaxed mb-8 font-light italic group-hover:text-white transition-colors'>
                          "{review.content}"
                        </p>
                        <div className='flex items-center gap-4'>
                          <img 
                            src={review.authorAvatar} 
                            alt={review.authorName} 
                            className='w-12 h-12 rounded-full object-cover border border-slate-700 shadow-lg' 
                          />
                          <div>
                            <h4 className='text-white font-bold text-sm'>{review.authorName}</h4>
                            <p className='text-slate-500 text-[10px] uppercase tracking-wider font-bold'>{review.profession}</p>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))
                )}
              </Swiper>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className='bg-slate-900 py-24 px-4 text-center'>
          <h2 className='text-3xl md:text-5xl font-extrabold text-white mb-6'>Ready to elevate your work?</h2>
          <p className='text-slate-400 max-w-2xl mx-auto mb-10 text-lg'>Join thousands of professionals finding their best work in our curated spaces.</p>
          <Link to='/signup' className='bg-white text-slate-900 px-10 py-4 rounded-full font-bold hover:bg-slate-100 transition-colors shadow-xl'>
            Get Started Free
          </Link>
        </div>

      </div>
    </AnimatedPage>
  );
}
