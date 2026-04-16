import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ListingItem from '../components/ListingItem';
import AnimatedPage from '../components/AnimatedPage';
import { FaSearch, FaFilter, FaCompass } from 'react-icons/fa';

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebardata, setSidebardata] = useState({
    searchTerm: '',
    type: 'all',
    category: 'all',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'created_at',
    order: 'desc',
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const typeFromUrl = urlParams.get('type');
    const parkingFromUrl = urlParams.get('parking');
    const furnishedFromUrl = urlParams.get('furnished');
    const categoryFromUrl = urlParams.get('category');
    const offerFromUrl = urlParams.get('offer');
    const sortFromUrl = urlParams.get('sort');
    const orderFromUrl = urlParams.get('order');

    if (
      searchTermFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      categoryFromUrl ||
      offerFromUrl ||
      sortFromUrl ||
      orderFromUrl
    ) {
      setSidebardata({
        searchTerm: searchTermFromUrl || '',
        type: typeFromUrl || 'all',
        category: categoryFromUrl || 'all',
        parking: parkingFromUrl === 'true' ? true : false,
        furnished: furnishedFromUrl === 'true' ? true : false,
        offer: offerFromUrl === 'true' ? true : false,
        sort: sortFromUrl || 'created_at',
        order: orderFromUrl || 'desc',
      });
    }

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      const searchQuery = urlParams.toString();
      const res = await fetch(`/api/listing/get?${searchQuery}`);
      const data = await res.json();
      if (data.length > 8) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
      setListings(data);
      setLoading(false);
    };

    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    if (
      e.target.id === 'all' ||
      e.target.id === 'rent' ||
      e.target.id === 'sale'
    ) {
      setSidebardata({ ...sidebardata, type: e.target.id });
    }

    if (
      e.target.id === 'all_cat' ||
      e.target.id === 'property' ||
      e.target.id === 'service'
    ) {
      const cat = e.target.id === 'all_cat' ? 'all' : e.target.id;
      setSidebardata({ ...sidebardata, category: cat });
    }

    if (e.target.id === 'searchTerm') {
      setSidebardata({ ...sidebardata, searchTerm: e.target.value });
    }

    if (
      e.target.id === 'parking' ||
      e.target.id === 'furnished' ||
      e.target.id === 'offer'
    ) {
      setSidebardata({
        ...sidebardata,
        [e.target.id]:
          e.target.checked || e.target.checked === 'true' ? true : false,
      });
    }

    if (e.target.id === 'sort_order') {
      const sort = e.target.value.split('_')[0] || 'created_at';

      const order = e.target.value.split('_')[1] || 'desc';

      setSidebardata({ ...sidebardata, sort, order });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set('searchTerm', sidebardata.searchTerm);
    urlParams.set('type', sidebardata.type);
    urlParams.set('category', sidebardata.category);
    urlParams.set('parking', sidebardata.parking);
    urlParams.set('furnished', sidebardata.furnished);
    urlParams.set('offer', sidebardata.offer);
    urlParams.set('sort', sidebardata.sort);
    urlParams.set('order', sidebardata.order);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const onShowMoreClick = async () => {
    const numberOfListings = listings.length;
    const startIndex = numberOfListings;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const searchQuery = urlParams.toString();
    const res = await fetch(`/api/listing/get?${searchQuery}`);
    const data = await res.json();
    if (data.length < 9) {
      setShowMore(false);
    }
    setListings([...listings, ...data]);
  };
  return (
    <AnimatedPage>
      <div className='flex flex-col md:flex-row min-h-screen pt-20 bg-slate-50'>

        {/* Filters Sidebar */}
        <div className='w-full md:w-[340px] bg-white border-b md:border-b-0 md:border-r border-slate-100 p-6 sm:p-8 flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 h-auto md:min-h-screen'>
          <div className='flex items-center gap-2 mb-8'>
            <FaFilter className='text-indigo-600' />
            <h2 className='text-xl font-extrabold text-slate-900'>Filter Search</h2>
          </div>

          <form onSubmit={handleSubmit} className='flex flex-col gap-6'>

            {/* Keyword Search */}
            <div className='flex flex-col gap-2'>
              <label className='text-sm font-semibold text-slate-700'>Search Keyword</label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FaSearch className='text-slate-400 text-sm' />
                </div>
                <input
                  type='text'
                  id='searchTerm'
                  placeholder='City, neighborhood, or name'
                  className='w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm text-slate-700 placeholder-slate-400'
                  value={sidebardata.searchTerm}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className='flex flex-col gap-3 pt-4 border-t border-slate-100'>
              <label className='text-sm font-semibold text-slate-700'>Listing Category</label>
              <div className='flex flex-wrap gap-3'>
                {[
                  { id: 'all_cat', label: 'All Categories', value: 'all' },
                  { id: 'property', label: 'Workspaces', value: 'property' },
                  { id: 'service', label: 'Services', value: 'service' }
                ].map((cat) => (
                  <label key={cat.id} className={`cursor-pointer flex items-center justify-center px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${sidebardata.category === cat.value ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    <input type='checkbox' id={cat.id} className='sr-only' onChange={handleChange} checked={sidebardata.category === cat.value} />
                    {cat.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Type Filter - Show only for properties */}
            {sidebardata.category !== 'service' && (
              <div className='flex flex-col gap-3 pt-4 border-t border-slate-100'>
                <label className='text-sm font-semibold text-slate-700'>Property Type</label>
                <div className='flex flex-wrap gap-3'>
                  {['all', 'rent', 'sale'].map((type) => (
                    <label key={type} className={`cursor-pointer flex items-center justify-center px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${sidebardata.type === type ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      <input type='checkbox' id={type} className='sr-only' onChange={handleChange} checked={sidebardata.type === type} />
                      {type === 'all' ? 'Rent & Sale' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Features (Offer, Parking, Furnished) */}
            <div className='flex flex-col gap-3 pt-4 border-t border-slate-100'>
              <label className='text-sm font-semibold text-slate-700'>Features & Offers</label>
              <div className='flex flex-col gap-3'>
                {[
                  { id: 'offer', label: 'Special Offers Only', alwaysShow: true },
                  { id: 'parking', label: 'Includes Parking', propertyOnly: true },
                  { id: 'furnished', label: 'Fully Furnished', propertyOnly: true }
                ].map((feature) => {
                  if (feature.propertyOnly && sidebardata.category === 'service') return null;
                  return (
                    <label key={feature.id} className='flex items-center gap-3 cursor-pointer group'>
                      <div className='relative flex items-center justify-center'>
                        <input type='checkbox' id={feature.id} className='peer sr-only' onChange={handleChange} checked={sidebardata[feature.id]} />
                        <div className='w-5 h-5 border-2 border-slate-300 rounded-md bg-white peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all'></div>
                        <svg className='absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='3'>
                          <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7'></path>
                        </svg>
                      </div>
                      <span className='text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors'>{feature.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Sorting */}
            <div className='flex flex-col gap-2 pt-4 border-t border-slate-100'>
              <label className='text-sm font-semibold text-slate-700'>Sort Results</label>
              <select
                onChange={handleChange}
                defaultValue={'created_at_desc'}
                id='sort_order'
                className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm text-slate-700 appearance-none'
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
              >
                <option value='createdAt_desc'>Latest First</option>
                <option value='createdAt_asc'>Oldest First</option>
                <option value='regularPrice_desc'>Price: High to Low</option>
                <option value='regularPrice_asc'>Price: Low to High</option>
              </select>
            </div>

            <button type="submit" className='w-full mt-4 bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all duration-300 shadow-md transform hover:-translate-y-[1px] text-sm'>
              Apply Filters
            </button>
          </form>
        </div>

        {/* Main Content Area */}
        <div className='flex-1 p-6 md:p-10 flex flex-col'>
          <div className='mb-8'>
            <h1 className='text-3xl font-extrabold text-slate-900 mb-2'>
              Workspace Results
            </h1>
            <p className='text-slate-500 font-light'>Discover your perfect environment based on your criteria.</p>
          </div>

          <div className='flex-1 flex flex-col'>
            {loading ? (
              <div className='flex-1 flex flex-col items-center justify-center'>
                <div className='w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4'></div>
                <p className='text-slate-500 font-medium'>Searching for spaces...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className='flex-1 flex flex-col items-center justify-center text-center'>
                <div className='w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-6'>
                  <FaCompass className='text-slate-300 text-5xl' />
                </div>
                <h3 className='text-xl font-bold text-slate-800 mb-2'>No Workspaces Found</h3>
                <p className='text-slate-500 max-w-sm'>
                  We couldn't find any listings matching your exact filters. Try adjusting your search criteria or explore nearby areas.
                </p>
                <button onClick={() => { setSidebardata({ searchTerm: '', type: 'all', parking: false, furnished: false, offer: false, sort: 'created_at', order: 'desc' }); handleSubmit(new Event('submit')); }} className='mt-6 text-indigo-600 font-semibold hover:underline'>
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-10'>
                  {listings.map((listing) => (
                    <ListingItem key={listing._id} listing={listing} />
                  ))}
                </div>

                {showMore && (
                  <div className='flex justify-center mt-auto pb-10'>
                    <button
                      onClick={onShowMoreClick}
                      className='bg-white border border-slate-200 text-slate-700 font-bold px-8 py-3 rounded-full hover:bg-slate-50 hover:shadow-sm transition-all duration-300 shadow-sm'
                    >
                      Load More Results
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </AnimatedPage>
  );
}