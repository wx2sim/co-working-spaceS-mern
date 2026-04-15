import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaStar, FaDoorOpen, FaBath } from 'react-icons/fa';

export default function ListingItem({ listing }) {
  return (
    <Link to={`/listing/${listing._id}`} className='bg-white border border-slate-100 rounded-3xl overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col w-full sm:w-[320px]'>
      <div className='relative h-[220px] w-full overflow-hidden bg-slate-100'>
        <img 
          src={listing.imageUrls?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop'} 
          alt='listing cover' 
          className='h-full w-full object-cover group-hover:scale-110 transition-transform duration-700' 
        />
        <div className='absolute top-3 left-3 flex flex-col gap-2'>
          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg uppercase tracking-wider backdrop-blur-md ${listing.type === 'rent' ? 'bg-indigo-600/90 text-white' : 'bg-emerald-600/90 text-white'}`}>
            {listing.type}
          </span>
          {listing.offer && (
            <span className='px-3 py-1.5 bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-bold rounded-full shadow-lg mx-auto self-start tracking-wider uppercase'>
              Special Offer
            </span>
          )}
        </div>
      </div>
      <div className='p-6 flex flex-col flex-1 relative'>
        <h3 className='text-lg font-bold text-slate-900 mb-1.5 truncate group-hover:text-indigo-600 transition-colors'>{listing.name}</h3>
        <div className='flex items-center gap-1.5 text-slate-500 mb-4'>
          <FaMapMarkerAlt className='text-xs text-indigo-400 shrink-0' />
          <p className='text-xs truncate font-medium'>{listing.address}</p>
        </div>
        <p className='text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1'>
          {listing.description}
        </p>
        
        <div className='flex items-center gap-4 mb-5 text-sm text-slate-500 font-medium'>
            <div className='flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100'>
              <FaDoorOpen className='text-slate-400 text-xs' />
              <span>{listing.rooms || 1} Rooms</span>
            </div>
            <div className='flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100'>
              <FaBath className='text-slate-400 text-xs' />
              <span>{listing.bathrooms || 1} Baths</span>
            </div>
        </div>

        <div className='pt-5 border-t border-slate-100 flex items-end justify-between mt-auto'>
          <div>
            <p className='text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5'>Pricing</p>
            <p className='text-xl font-extrabold text-slate-900'>
              ${listing.offer ? listing.discountPrice?.toLocaleString('en-US') : listing.regularPrice?.toLocaleString('en-US')}
              {listing.type === 'rent' && <span className='text-xs text-slate-500 font-medium'> /mo</span>}
            </p>
          </div>
          <div className='flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-lg'>
            <FaStar className='text-xs' />
            <span className='text-xs font-bold text-amber-700'>4.9</span>
          </div>
        </div>
      </div>
    </Link>
  );
}