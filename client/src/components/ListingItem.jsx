import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaStar, FaDoorOpen, FaBath } from 'react-icons/fa';
import HoverCard from './HoverCard';

export default function ListingItem({ listing }) {
  return (
    <HoverCard className="h-full">
      <Link 
        to={`/listing/${listing._id}`} 
        className='group block h-full rounded-2xl border border-neutral-500/10 p-5 bg-gray-50 dark:bg-zinc-800/80 dark:border-white/10 dark:shadow-[2px_4px_16px_0px_rgba(248,248,248,0.06)_inset] transition-all duration-300'
      >
        <div className='relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-900 mb-4'>
          <img 
            src={listing.imageUrls?.[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop'} 
            alt='listing cover' 
            className='h-full w-full object-cover group-hover:scale-105 transition-transform duration-700' 
          />
          <div className='absolute top-3 left-3 flex flex-col gap-1.5'>
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/10 ${
              listing.category === 'service' ? 'bg-amber-500/80 text-white' :
              listing.type === 'rent' ? 'bg-indigo-500/80 text-white' : 'bg-emerald-500/80 text-white'
            }`}>
              {listing.category === 'service' ? 'Service' : listing.type}
            </span>
          </div>
        </div>

        <div className='flex flex-col'>
          <div className='flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500 mb-2'>
            <FaMapMarkerAlt className='text-[10px]' />
            <p className='text-[10px] uppercase tracking-tighter font-medium truncate'>{listing.address}</p>
          </div>

          <h3 className='text-lg font-semibold text-gray-700 dark:text-gray-200 tracking-tighter mb-3 truncate transition-all group-hover:scale-90 origin-left group-hover:text-indigo-500'>
            {listing.name}
          </h3>
          
          {listing.category !== 'service' && (
            <div className='flex items-center gap-4 mb-4 text-neutral-400 dark:text-neutral-500'>
                <div className='flex items-center gap-1.5'>
                  <FaDoorOpen className='text-[10px]' />
                  <span className='text-[11px] font-medium tracking-tight'>{listing.rooms || 1} Rooms</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <FaBath className='text-[10px]' />
                  <span className='text-[11px] font-medium tracking-tight'>{listing.bathrooms || 1} Baths</span>
                </div>
            </div>
          )}

          <div className='pt-4 border-t border-neutral-500/10 dark:border-white/5 flex items-center justify-between mt-auto'>
            <div className='flex flex-col'>
              <p className='text-xl font-bold text-gray-600 dark:text-gray-300 tracking-tighter leading-none'>
                {listing.offer ? listing.discountPrice?.toLocaleString('en-US') : listing.regularPrice?.toLocaleString('en-US')}
                <span className='ml-1 text-sm'>DA</span>
                {listing.category === 'property' && listing.type === 'rent' && <span className='text-[10px] font-medium opacity-40 ml-0.5'>/mo</span>}
              </p>
            </div>
            <div className='flex items-center gap-1 text-amber-500/80'>
              <FaStar className='text-[10px]' />
              <span className='text-[11px] font-bold'>4.9</span>
            </div>
          </div>
        </div>
      </Link>
    </HoverCard>
  );
}