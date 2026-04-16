import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AddReviewModal({ isOpen, onClose, onReviewAdded }) {
  const [formData, setFormData] = useState({
    authorName: '',
    authorAvatar: '',
    rating: 5,
    content: '',
    profession: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/review/create', formData);
      toast.success('Review added successfully!');
      onReviewAdded(data);
      setFormData({
        authorName: '',
        authorAvatar: '',
        rating: 5,
        content: '',
        profession: ''
      });
      onClose();
    } catch (error) {
      toast.error('Failed to add review');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl'>
        <h2 className='text-2xl font-bold mb-6 text-slate-800'>Add User Testimonial</h2>
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider'>Author Name</label>
              <input 
                type='text' 
                required 
                value={formData.authorName}
                onChange={(e) => setFormData({...formData, authorName: e.target.value})}
                className='w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all'
                placeholder='John Doe'
              />
            </div>
            <div>
              <label className='text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider'>Profession</label>
              <input 
                type='text' 
                value={formData.profession}
                onChange={(e) => setFormData({...formData, profession: e.target.value})}
                className='w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all'
                placeholder='Freelancer'
              />
            </div>
          </div>

          <div>
            <label className='text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider'>Avatar URL (Optional)</label>
            <input 
              type='text' 
              value={formData.authorAvatar}
              onChange={(e) => setFormData({...formData, authorAvatar: e.target.value})}
              className='w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all'
              placeholder='https://...'
            />
          </div>

          <div>
            <label className='text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider'>Rating (1-5)</label>
            <input 
              type='number' 
              min='1' 
              max='5'
              required 
              value={formData.rating}
              onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
              className='w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all'
            />
          </div>

          <div>
            <label className='text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider'>Review Content</label>
            <textarea 
              required 
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className='w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px] resize-none'
              placeholder='Tell us what they said...'
            ></textarea>
          </div>

          <div className='flex gap-3 mt-2'>
            <button 
              type='button' 
              onClick={onClose}
              className='flex-1 py-3.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors'
            >
              Cancel
            </button>
            <button 
              type='submit' 
              disabled={loading}
              className='flex-1 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30'
            >
              {loading ? 'Posting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
