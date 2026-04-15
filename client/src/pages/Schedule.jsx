import AnimatedPage from '../components/AnimatedPage';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Schedule() {
  // Dummy data to make the page look alive and elegant
  const upcomingEvents = [
    { id: 1, title: 'Client Meeting - Creative Studio X', date: 'Oct 24, 2024', time: '10:00 AM - 12:00 PM', status: 'Confirmed', type: 'meeting' },
    { id: 2, title: 'Workspace Maintenance Check', date: 'Oct 25, 2024', time: '08:00 AM - 09:00 AM', status: 'Pending', type: 'internal' },
    { id: 3, title: 'Freelancer Network Event Hosted', date: 'Oct 28, 2024', time: '05:00 PM - 09:00 PM', status: 'Confirmed', type: 'event' }
  ];

  return (
    <AnimatedPage>
      <div className='min-h-screen pt-28 pb-10 px-4 max-w-6xl mx-auto'>
        <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4'>
          <div>
            <h1 className='text-3xl font-extrabold text-slate-900 mb-2'>My Schedule</h1>
            <p className='text-slate-500 font-light max-w-xl'>
              Manage your upcoming events, client bookings, and workspace availability calendar.
            </p>
          </div>
          <Link to='/dashboard' className='text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors self-start sm:self-auto flex items-center gap-2'>
            Go back to Dashboard
          </Link>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Calendar Placeholder Area */}
          <div className='lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]'>
            <div className='w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center mb-6 text-indigo-600 shadow-inner'>
              <FaCalendarAlt size={32} />
            </div>
            <h3 className='text-2xl font-bold text-slate-900 mb-3'>Advanced Calendar Sync</h3>
            <p className='text-slate-500 text-center max-w-md leading-relaxed mb-8'>
              We are finalizing our Google Calendar & Outlook integration. Soon you'll be able to manage all client reservations seamlessly inside this view.
            </p>
            <div className='flex items-center gap-2 text-xs font-bold px-4 py-2 bg-slate-50 text-slate-500 rounded-full border border-slate-200'>
              <div className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse'></div>
              FEATURE IN DEVELOPMENT
            </div>
          </div>

          {/* Upcoming Snapshot Overview */}
          <div className='flex flex-col gap-6'>
            <div className='bg-slate-900 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative'>
              <div className='absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-[0.03] rounded-full -mr-10 -mt-10'></div>
              <h3 className='text-lg font-bold mb-6 flex items-center gap-2 relative z-10'>
                <FaClock className='text-indigo-400' /> Upcoming Week
              </h3>
              
              <div className='flex flex-col gap-4 relative z-10'>
                {upcomingEvents.map(event => (
                  <div key={event.id} className='bg-slate-800/50 hover:bg-slate-800 transition-colors rounded-2xl p-4 border border-slate-700/50 backdrop-blur-md'>
                    <div className='flex items-start justify-between mb-2'>
                      <h4 className='font-semibold text-sm truncate pr-4'>{event.title}</h4>
                      {event.status === 'Confirmed' ? (
                        <FaCheckCircle className='text-emerald-400 shrink-0 mt-0.5' size={14} />
                      ) : (
                        <FaExclamationCircle className='text-amber-400 shrink-0 mt-0.5' size={14} />
                      )}
                    </div>
                    <div className='text-xs text-slate-400 flex flex-col gap-1'>
                      <span className='flex items-center gap-1.5'><FaCalendarAlt size={10} /> {event.date}</span>
                      <span className='flex items-center gap-1.5'><FaClock size={10} /> {event.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-indigo-50 border border-indigo-100 rounded-3xl p-6 relative overflow-hidden'>
               <div className='relative z-10'>
                 <h3 className='text-indigo-900 font-bold mb-2'>Need to block days out?</h3>
                 <p className='text-indigo-700 text-xs mb-4 leading-relaxed'>
                   You can temporarily disable listings from your dashboard if your space is under maintenance or privately booked.
                 </p>
                 <Link to='/dashboard' className='text-xs font-bold text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-block'>
                   Go to Workspace Settings
                 </Link>
               </div>
               <div className='absolute -bottom-4 -right-4 opacity-10 text-indigo-900'>
                 <FaCalendarAlt size={100} />
               </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
