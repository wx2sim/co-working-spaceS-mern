import React, { useState } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

export default function CreateListingModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    category: 'property', // 'property' or 'service'
    type: 'rent',
    rooms: 1,
    availableRooms: 1,
    confirencerooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });

  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAutoUpload = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    const oversizedFiles = selectedFiles.filter(file => file.size > 2 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setImageUploadError(t('image_size_error'));
      return;
    }

    if (selectedFiles.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        promises.push(storeImage(selectedFiles[i]));
      }

      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError(`${t('upload_failed')}: ${err.message}`);
          setUploading(false);
        });
    } else {
      setImageUploadError(t('max_images_error'));
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {},
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    if (e.target.id === 'sale' || e.target.id === 'rent') {
      setFormData({ ...formData, type: e.target.id });
    }
    if (e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer') {
      setFormData({ ...formData, [e.target.id]: e.target.checked });
    }
    if (e.target.type === 'number' || e.target.type === 'text' || e.target.type === 'textarea') {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1) return setError(t('at_least_one_image'));
      if (+formData.regularPrice < +formData.discountPrice) return setError(t('discount_price_error'));
      
      setLoading(true);
      setError(false);
      
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/listing/create`, {
        ...formData,
        userRef: currentUser._id,
      });
      
      setLoading(false);
      
      if (data.success === false) {
        setError(data.message);
      } else {
        onClose(); 
        navigate(`/listing/${data._id}`); 
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 transition-all">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">{t('create_listing')}</h2>
            <p className="text-sm text-slate-500 font-light">{t('publish_listing_desc')}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-red-100 hover:text-red-600 transition-colors">
            &#10005;
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
          <form onSubmit={handleSubmit} className='flex flex-col md:flex-row gap-8'>
            <div className='flex flex-col gap-4 flex-1'>
              <input type='text' placeholder={t('listing_name')} id='name' maxLength='62' minLength='10' required onChange={handleChange} value={formData.name} className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all text-sm' />
              <textarea placeholder={t('listing_desc')} id='description' required onChange={handleChange} value={formData.description} className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all text-sm min-h-[100px]' />
              <input type='text' placeholder={t('listing_address')} id='address' required onChange={handleChange} value={formData.address} className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all text-sm' />
              
              <div className='flex flex-col gap-2 mt-2'>
                <label className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>{t('listing_category')}</label>
                <div className='flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit'>
                  <button 
                    type='button' 
                    onClick={() => setFormData({...formData, category: 'property'})}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${formData.category === 'property' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {t('property')}
                  </button>
                  <button 
                    type='button' 
                    onClick={() => setFormData({...formData, category: 'service'})}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${formData.category === 'service' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {t('service')}
                  </button>
                </div>
              </div>

              {formData.category === 'property' && (
                <div className='flex gap-4 flex-wrap mt-2'>
                  <div className='flex gap-2 items-center'>
                    <input type='checkbox' id='sale' className='w-5 h-5 accent-slate-900' onChange={handleChange} checked={formData.type === 'sale'} />
                    <label htmlFor='sale' className='text-sm text-slate-700'>{t('sell')}</label>
                  </div>
                  <div className='flex gap-2 items-center'>
                    <input type='checkbox' id='rent' className='w-5 h-5 accent-slate-900' onChange={handleChange} checked={formData.type === 'rent'} />
                    <label htmlFor='rent' className='text-sm text-slate-700'>{t('rent')}</label>
                  </div>
                  <div className='flex gap-2 items-center'>
                    <input type='checkbox' id='parking' className='w-5 h-5 accent-slate-900' onChange={handleChange} checked={formData.parking} />
                    <label htmlFor='parking' className='text-sm text-slate-700'>{t('parking_spot')}</label>
                  </div>
                  <div className='flex gap-2 items-center'>
                    <input type='checkbox' id='furnished' className='w-5 h-5 accent-slate-900' onChange={handleChange} checked={formData.furnished} />
                    <label htmlFor='furnished' className='text-sm text-slate-700'>{t('furnished')}</label>
                  </div>
                  <div className='flex gap-2 items-center'>
                    <input type='checkbox' id='offer' className='w-5 h-5 accent-slate-900' onChange={handleChange} checked={formData.offer} />
                    <label htmlFor='offer' className='text-sm text-slate-700'>{t('offer')}</label>
                  </div>
                </div>
              )}

              {formData.category === 'service' && (
                <div className='flex gap-4 flex-wrap mt-2'>
                  <div className='flex gap-2 items-center'>
                    <input type='checkbox' id='offer' className='w-5 h-5 accent-slate-900' onChange={handleChange} checked={formData.offer} />
                    <label htmlFor='offer' className='text-sm text-slate-700'>{t('special_offer')}</label>
                  </div>
                </div>
              )}

              <div className='flex flex-wrap gap-4 mt-2'>
                {formData.category === 'property' && (
                  <>
                    <div className='flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200'>
                      <input type='number' id='rooms' min='1' max='50' required onChange={handleChange} value={formData.rooms} className='w-16 p-2 border border-slate-300 rounded-lg outline-none' />
                      <span className='text-sm text-slate-700 font-medium'>{t('rooms')}</span>
                    </div>
                    <div className='flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200'>
                      <input type='number' id='availableRooms' min='1' max='50' required onChange={handleChange} value={formData.availableRooms} className='w-16 p-2 border border-slate-300 rounded-lg outline-none' />
                      <span className='text-sm text-slate-700 font-medium'>{t('available')}</span>
                    </div>
                    <div className='flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200'>
                      <input type='number' id='confirencerooms' min='0' max='20' required onChange={handleChange} value={formData.confirencerooms} className='w-16 p-2 border border-slate-300 rounded-lg outline-none' />
                      <span className='text-sm text-slate-700 font-medium'>{t('conf_rooms')}</span>
                    </div>
                    <div className='flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200'>
                      <input type='number' id='bathrooms' min='1' max='20' required onChange={handleChange} value={formData.bathrooms} className='w-16 p-2 border border-slate-300 rounded-lg outline-none' />
                      <span className='text-sm text-slate-700 font-medium'>{t('baths')}</span>
                    </div>
                  </>
                )}
                
                <div className='flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200'>
                  <input type='number' id='regularPrice' min='50' max='10000000' required onChange={handleChange} value={formData.regularPrice} className='w-24 p-2 border border-slate-300 rounded-lg outline-none' />
                  <div className='flex flex-col'>
                    <span className='text-sm text-slate-700 font-medium'>{formData.category === 'property' ? t('regular_price') : t('service_price')}</span>
                    {formData.category === 'property' && formData.type === 'rent' && <span className='text-xs text-slate-500'>({t('da_month')})</span>}
                    {formData.category === 'service' && <span className='text-xs text-slate-500'>({t('total_da')})</span>}
                  </div>
                </div>
                {formData.offer && (
                  <div className='flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200'>
                    <input type='number' id='discountPrice' min='0' max='10000000' required onChange={handleChange} value={formData.discountPrice} className='w-24 p-2 border border-slate-300 rounded-lg outline-none' />
                    <div className='flex flex-col'>
                      <span className='text-sm text-slate-700 font-medium'>{t('discounted_price')}</span>
                      {formData.type === 'rent' && <span className='text-xs text-slate-500'>({t('da_month')})</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='flex flex-col flex-1 gap-4'>
              <p className='font-semibold text-slate-800'>
                {t('images')}:
                <span className='font-normal text-slate-500 text-sm ml-2'>
                  {t('cover_image_desc')}
                </span>
              </p>
              
              <div className='flex flex-col gap-3'>
                <input
                  onChange={handleAutoUpload} 
                  disabled={uploading}
                  className='p-3 border border-slate-200 bg-slate-50 rounded-xl w-full text-sm text-slate-500 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 disabled:opacity-50'
                  type='file' id='images' accept='image/*' multiple
                />
                {uploading && (
                  <p className='text-green-600 text-sm font-medium animate-pulse'>
                    {t('uploading_wait')}
                  </p>
                )}
              </div>
              
              <p className='text-red-500 text-sm font-medium'>
                {imageUploadError && imageUploadError}
              </p>
              
              {formData.imageUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                  {formData.imageUrls.map((url, index) => (
                    <div key={url} className='flex justify-between items-center p-2 border border-slate-200 rounded-xl bg-white'>
                      <img src={url} alt='listing image' className='w-16 h-16 object-cover rounded-lg' />
                      <button
                        type='button' onClick={() => handleRemoveImage(index)}
                        className='text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors'
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                disabled={loading || uploading}
                className='mt-auto w-full py-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all disabled:opacity-70 shadow-sm'
              >
                {loading ? t('creating_listing') : t('publish_listing')}
              </button>
              
              {error && <p className='text-red-500 text-sm font-medium text-center p-3 bg-red-50 rounded-xl'>{error}</p>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}