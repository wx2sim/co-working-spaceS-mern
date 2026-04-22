import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import { FaSearch, FaMapMarkerAlt, FaStar, FaArrowRight, FaCity, FaWifi, FaCoffee } from 'react-icons/fa';
import AnimatedPage from '../components/AnimatedPage';
import ListingItem from '../components/ListingItem';
import useDocumentTitle from '../hooks/useDocumentTitle';
import hero1 from '../assets/Hero/photo1.avif';
import hero2 from '../assets/Hero/photo2.jpg';
import hero3 from '../assets/Hero/photo3.avif';
import hero4 from '../assets/Hero/photo4.avif';
import { useLanguage } from '../context/LanguageContext';


export default function Home() {
  useDocumentTitle('Co-Spaces');
  SwiperCore.use([Navigation, Autoplay]);
  const { language, t } = useLanguage();
const [offerListings, setOfferListings] = useState([]);
const [latestListings, setLatestListings] = useState([]);
const [rentListings, setRentListings] = useState([]);
const [saleListings, setSaleListings] = useState([]);
const [serviceListings, setServiceListings] = useState([]);
const [reviews, setReviews] = useState([]);
const [providers, setProviders] = useState([]);
const [searchTerm, setSearchTerm] = useState('');
const navigate = useNavigate();

useEffect(() => {
  const fetchAllData = async () => {
    try {
      const [offers, latest, rent, sale, services, reviewsRes, providersRes] = await Promise.allSettled([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/listing/get?offer=true&limit=4&sort=discountPrice&order=asc`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/listing/get?category=property&limit=4&sort=createdAt&order=desc`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/listing/get?type=rent&category=property&limit=4&sort=averageRating&order=desc`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/listing/get?type=sale&category=property&limit=4&sort=averageRating&order=desc`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/listing/get?category=service&limit=4&sort=averageRating&order=desc`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/review/get`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/top-providers`)
      ]);

      if (offers.status === 'fulfilled') setOfferListings(offers.value.data);
      if (latest.status === 'fulfilled') setLatestListings(latest.value.data);
      if (rent.status === 'fulfilled') setRentListings(rent.value.data);
      if (sale.status === 'fulfilled') setSaleListings(sale.value.data);
      if (services.status === 'fulfilled') setServiceListings(services.value.data);
      if (reviewsRes.status === 'fulfilled') setReviews(reviewsRes.value.data);
      if (providersRes.status === 'fulfilled') setProviders(providersRes.value.data);
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    }
  };
  fetchAllData();
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
            key={language}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            modules={[Autoplay]}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            speed={1500}
            loop={true}
            slidesPerView={1}
            spaceBetween={0}
            centeredSlides={true}
            roundLengths={true}
            allowTouchMove={false}
            className='h-full w-full'
          >
            {[hero1, hero2, hero3, hero4].map((img, idx) => (
              <SwiperSlide key={idx} className='h-full w-full overflow-hidden'>
                <img src={img} alt='Hero background' className='w-full h-full object-cover scale-105 transform origin-center animate-pulse-slow' />
                <div className='absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/90 mix-blend-multiply'></div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Hero Content */}
        <div className='relative z-10 w-full max-w-5xl mx-auto px-4 text-center pt-24 md:pt-0 pb-20'>
          <span className='inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold tracking-wider uppercase mb-6'>
            {t('hero_span')}
          </span>
          <h1 className='text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight'>
            {t('hero_title')} <br className='hidden md:block' />
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300'>{t('hero_title_span')}</span>.
          </h1>
          <p className='text-slate-300 text-lg sm:text-xl font-light mb-10 max-w-2xl mx-auto leading-relaxed'>
            {t('hero_p')}
          </p>

          {/* Smart Search Bar */}
          <form onSubmit={handleSearchSubmit} className='max-w-3xl mx-auto relative group'>
            <div className='absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300'></div>
            <div className='relative flex items-center bg-white rounded-2xl p-2 shadow-2xl'>
              <div className='ps-4 text-slate-400'>
                <FaSearch size={20} />
              </div>
              <input
                type='text'
                placeholder={t('search_placeholder')}
                className='flex-1 bg-transparent px-4 py-4 text-slate-700 focus:outline-none text-form'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type='submit'
                className='bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-md hidden sm:block'
              >
                {t('explore')}
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
            <h3 className='text-xl font-bold text-slate-900 mb-3'>{t('prime_locations')}</h3>
            <p className='text-slate-500 leading-relaxed font-light text-sm'>{t('prime_locations_p')}</p>
          </div>
          <div className='bg-white rounded-2xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 transform hover:-translate-y-2 transition-transform duration-300 delay-100'>
            <div className='w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 text-emerald-600'>
              <FaWifi size={24} />
            </div>
            <h3 className='text-xl font-bold text-slate-900 mb-3'>{t('fast_internet')}</h3>
            <p className='text-slate-500 leading-relaxed font-light text-sm'>{t('fast_internet_p')}</p>
          </div>
          <div className='bg-white rounded-2xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 transform hover:-translate-y-2 transition-transform duration-300 delay-200'>
            <div className='w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6 text-amber-600'>
              <FaCoffee size={24} />
            </div>
            <h3 className='text-xl font-bold text-slate-900 mb-3'>{t('amenities')}</h3>
            <p className='text-slate-500 leading-relaxed font-light text-sm'>{t('amenities_p')}</p>
          </div>
        </div>

        {/* Latest Workspaces */}
        {latestListings && latestListings.length > 0 && (
          <div className='mb-24'>
            <div className='flex items-end justify-between mb-8'>
              <div>
                <h2 className='text-3xl font-extrabold text-slate-900 mb-2'>{t('latest_added')}</h2>
                <p className='text-slate-500'>{t('latest_p')}</p>
              </div>
              <Link to='/search?category=property' className='text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center gap-2 transition-colors'>
                {t('see_all')} <FaArrowRight />
              </Link>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
              {latestListings.map((listing, index) => (
                <div key={listing._id} className={index >= 2 ? 'hidden lg:block' : 'block'}>
                  <ListingItem listing={listing} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Places for Rent */}
        {rentListings && rentListings.length > 0 && (
          <div className='mb-24'>
            <div className='flex items-end justify-between mb-8'>
              <div>
                <h2 className='text-3xl font-extrabold text-slate-900 mb-2'>{t('premium_rentals')}</h2>
                <p className='text-slate-500'>{t('rent_p')}</p>
              </div>
              <Link to='/search?type=rent&category=property' className='text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center gap-2 transition-colors'>
                {t('see_all')} <FaArrowRight />
              </Link>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
              {rentListings.map((listing, index) => (
                <div key={listing._id} className={index >= 2 ? 'hidden lg:block' : 'block'}>
                  <ListingItem listing={listing} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Places for Sale */}
        {saleListings && saleListings.length > 0 && (
          <div className='mb-24'>
            <div className='flex items-end justify-between mb-8'>
              <div>
                <h2 className='text-3xl font-extrabold text-slate-900 mb-2'>{t('sale_places')}</h2>
                <p className='text-slate-500'>{t('sale_p')}</p>
              </div>
              <Link to='/search?type=sale&category=property' className='text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center gap-2 transition-colors'>
                {t('see_all')} <FaArrowRight />
              </Link>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
              {saleListings.map((listing, index) => (
                <div key={listing._id} className={index >= 2 ? 'hidden lg:block' : 'block'}>
                  <ListingItem listing={listing} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professional Services */}
        {serviceListings && serviceListings.length > 0 && (
          <div className='mb-24'>
            <div className='flex items-end justify-between mb-8'>
              <div>
                <h2 className='text-3xl font-extrabold text-slate-900 mb-2'>{t('professional_services')}</h2>
                <p className='text-slate-500'>{t('services_p')}</p>
              </div>
              <Link to='/search?category=service' className='text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center gap-2 transition-colors'>
                {t('see_all')} <FaArrowRight />
              </Link>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
              {serviceListings.map((listing, index) => (
                <div key={listing._id} className={index >= 2 ? 'hidden lg:block' : 'block'}>
                  <ListingItem listing={listing} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Rated Rent Repeating for emphasis as requested */}
        {rentListings && rentListings.length > 0 && (
          <div className='mb-24 pt-12 border-t border-slate-100'>
            <div className='flex items-end justify-between mb-8'>
              <div>
                <h2 className='text-3xl font-extrabold text-slate-900 mb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 uppercase tracking-tighter'>{t('top_rented')}</h2>
                <p className='text-slate-500'>{t('top_rented_p')}</p>
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
              {rentListings.map((listing, index) => (
                <div key={listing._id} className={index >= 2 ? 'hidden lg:block' : 'block'}>
                  <ListingItem listing={listing} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Special Offers Repeating for emphasis as requested */}
        {offerListings && offerListings.length > 0 && (
          <div className='mb-24'>
            <div className='flex items-end justify-between mb-8'>
              <div>
                <h2 className='text-3xl font-extrabold text-slate-900 mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 uppercase tracking-tighter'>{t('best_offers')}</h2>
                <p className='text-slate-500'>{t('offers_p')}</p>
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
              {offerListings.map((listing, index) => (
                <div key={listing._id} className={index >= 2 ? 'hidden lg:block' : 'block'}>
                  <ListingItem listing={listing} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Service Providers */}
        {providers && providers.length > 0 && (
          <div className='mb-24'>
            <div className='flex items-end justify-between mb-8'>
              <div>
                <h2 className='text-3xl font-extrabold text-slate-900 mb-2'>{t('top_providers')}</h2>
                <p className='text-slate-500'>{t('providers_p')}</p>
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
                  <p className='text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3'>{t('provider_label')}</p>

                  <div className='flex items-center justify-center gap-3 pt-3 border-t border-slate-50'>
                    <div className='text-center'>
                      <p className='text-[10px] font-bold text-slate-700'>{provider.listingCount}</p>
                      <p className='text-[8px] text-slate-400'>{t('listings')}</p>
                    </div>
                    <div className='w-px h-4 bg-slate-100'></div>
                    <div className='text-center'>
                      <p className='text-[10px] font-bold text-indigo-600'>{provider.activityScore}</p>
                      <p className='text-[8px] text-slate-400'>{t('activity')}</p>
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
          <div className='absolute bottom-0 -right-1/4 w-1/2 h-[500px] bg-cyan-600 rounded-full mix-blend-screen filter blur-[150px] animate-pulse-slow' style={{ animationDelay: '2s' }}></div>
        </div>

        <div className='max-w-6xl mx-auto px-4 relative z-10'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-5xl font-extrabold text-white mb-4'>{t('reviews_title')}</h2>
            <p className='text-slate-400 max-w-2xl mx-auto text-lg'>{t('reviews_p')}</p>
          </div>

          <div className='mt-8'>
            <Swiper
              key={language}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
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
        <h2 className='text-3xl md:text-5xl font-extrabold text-white mb-6'>{t('cta_title')}</h2>
        <p className='text-slate-400 max-w-2xl mx-auto mb-10 text-lg'>{t('cta_p')}</p>
        <Link to='/signup' className='bg-white text-slate-900 px-10 py-4 rounded-full font-bold hover:bg-slate-100 transition-colors shadow-xl'>
          {t('get_started')}
        </Link>
      </div>

      </div>
    </AnimatedPage>
  );
}

