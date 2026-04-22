import AnimatedPage from '../components/AnimatedPage';
import { FaMapMarkedAlt, FaSearchLocation, FaLocationArrow } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Map() {
  useDocumentTitle('Map | Co-Spaces');
  return (
    <AnimatedPage>
      <div className='min-h-screen pt-28 pb-10 px-4 max-w-6xl mx-auto flex flex-col'>
        <div className='mb-8'>
          <h1 className='text-3xl font-extrabold text-slate-900 mb-2'>Interactive Map</h1>
          <p className='text-slate-500 font-light max-w-2xl'>
            Explore all available premium co-working spaces and private offices geographically. Pinpoint your perfect location.
          </p>
        </div>

        <div className='flex-1 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden relative flex flex-col'>
          {/* Faux Map Background using a gorgeous abstract pattern or standard map image */}
          <div className='absolute inset-0 z-0 bg-[url("https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop")] bg-cover bg-center opacity-40 grayscale blur-[2px]'></div>
          <div className='absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/60 to-transparent z-10'></div>

          <div className='relative z-20 flex-1 flex flex-col items-center justify-center p-8 text-center'>
            <div className='w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-600/30 animate-bounce'>
              <FaMapMarkedAlt className='text-white text-4xl' />
            </div>
            <h2 className='text-3xl font-bold text-white mb-4 drop-shadow-md'>Map View Coming Soon</h2>
            <p className='text-slate-200 max-w-lg mb-8 leading-relaxed drop-shadow-sm text-sm sm:text-base'>
              We are currently integrating high-performance interactive maps to help you browse workspaces directly on the grid. Stay tuned for an immersive location experience!
            </p>
            
            <div className='flex flex-col sm:flex-row gap-4'>
              <Link to='/search' className='flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg'>
                <FaSearchLocation /> Browse List View
              </Link>
              <button disabled className='flex items-center justify-center gap-2 bg-slate-800/80 backdrop-blur-md text-white border border-slate-600 px-6 py-3 rounded-xl font-semibold opacity-70 cursor-not-allowed'>
                <FaLocationArrow /> Enable Location API
              </button>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
