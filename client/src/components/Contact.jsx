import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState('');
  const onChange = (e) => {
    setMessage(e.target.value);
  };

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const { data } = await axios.get(`/api/user/${listing.userRef}`)
        setLandlord(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLandlord();
  }, [listing.userRef]);
  return (
    <>
      {landlord && (
        <div className='flex flex-col gap-2'>
          <p>
            Contact <span className='font-semibold'>{landlord.username}</span>{' '}
            for{' '} <span className='font-semibold'>{listing.name.toLowerCase()}</span>
          </p>
          <textarea
            name='message'
            id='message'
            rows='4'
            value={message}
            onChange={onChange}
            placeholder='Enter your message here...'
            className='w-full border p-3 rounded-lg text-sm'
          ></textarea>
          
          <div className='flex gap-3 mt-2'>
            <a
              href={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${message}`}
              target="_blank"
              className='flex-1 bg-white border border-slate-300 text-slate-700 text-sm font-semibold text-center py-3 rounded-xl hover:bg-slate-50 transition-colors'
            >
              Send Email
            </a>
            <button
              onClick={async () => {
                try {
                  const { data } = await axios.post('/api/message/send', {
                    receiverId: landlord._id,
                    listingId: listing._id,
                    content: message
                  });
                  toast.success('Direct message sent successfully!');
                  setMessage('');
                } catch (error) {
                  toast.error('Failed to send message');
                }
              }}
              disabled={!message.trim()}
              className='flex-1 bg-slate-900 text-white text-sm font-semibold text-center py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Direct Message
            </button>
          </div>
        </div>
      )}
    </>
  );
}