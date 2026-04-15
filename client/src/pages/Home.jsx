import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectFade } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import { FaSearch, FaMapMarkerAlt, FaStar, FaArrowRight, FaCity, FaWifi, FaCoffee } from 'react-icons/fa';
import AnimatedPage from '../components/AnimatedPage';

export default function Home() {
  SwiperCore.use([Navigation, Autoplay, EffectFade]);
  const [offerListings, setOfferListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
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
    fetchOfferListings();
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
      <div className='min-h-screen bg-slate-50'>

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
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                {offerListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
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
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                {rentListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>
            </div>
          )}

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

// Reusable elegant Card Component
function ListingCard({ listing }) {
  return (
    <Link to={`/listing/${listing._id}`} className='bg-white border border-slate-100 rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col'>
      <div className='relative h-[220px] w-full overflow-hidden'>
        <img
          src={listing.imageUrls[0]}
          alt='listing cover'
          className='h-full w-full object-cover group-hover:scale-110 transition-transform duration-700'
        />
        <div className='absolute top-3 left-3 flex flex-col gap-2'>
          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wider backdrop-blur-md ${listing.type === 'rent' ? 'bg-indigo-600/90 text-white' : 'bg-emerald-600/90 text-white'}`}>
            {listing.type}
          </span>
          {listing.offer && (
            <span className='px-3 py-1 bg-rose-500/90 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-sm mx-auto self-start'>
              Discount
            </span>
          )}
        </div>
      </div>
      <div className='p-5 flex flex-col flex-1'>
        <h3 className='text-lg font-bold text-slate-900 mb-1 truncate'>{listing.name}</h3>
        <div className='flex items-center gap-1.5 text-slate-500 mb-4'>
          <FaMapMarkerAlt className='text-xs text-indigo-400' />
          <p className='text-xs truncate font-medium'>{listing.address}</p>
        </div>
        <p className='text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1'>
          {listing.description}
        </p>
        <div className='pt-4 border-t border-slate-100 flex items-center justify-between mt-auto'>
          <p className='text-xl font-extrabold text-slate-900'>
            ${listing.offer ? listing.discountPrice.toLocaleString('en-US') : listing.regularPrice.toLocaleString('en-US')}
            {listing.type === 'rent' && <span className='text-xs text-slate-500 font-medium'> /mo</span>}
          </p>
          <div className='flex items-center gap-1 text-amber-400'>
            <FaStar className='text-sm' />
            <span className='text-sm font-bold text-slate-700'>4.9</span>
          </div>
        </div>
      </div>
    </Link>
  );
}