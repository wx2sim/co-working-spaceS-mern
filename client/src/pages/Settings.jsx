import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTheme } from '../redux/theme/themeSlice';
import AnimatedPage from '../components/AnimatedPage';
import { FaBell, FaShieldAlt, FaPalette, FaGlobe, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useLanguage } from '../context/LanguageContext';

export default function Settings() {
  const { t, language: currentLang, changeLanguage } = useLanguage();
  useDocumentTitle(`${t('app_settings')} | Co-Spaces`);
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  
  const [activeTab, setActiveTab] = useState('notifications');
  
  // Settings State mapped to LocalStorage for persistence
  const [settings, setSettings] = useState({
    emailAlerts: true,
    bookingReminders: true,
    marketingEmails: false,
    twoFactorAuth: false,
    loginAlerts: true,
    theme: 'light',
    language: currentLang
  });

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`settings_${currentUser._id}`);
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, [currentUser._id]);

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem(`settings_${currentUser._id}`, JSON.stringify(newSettings));
    toast.success(t('settings_updated'));
  };

  const handleSelectChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(`settings_${currentUser._id}`, JSON.stringify(newSettings));
    toast.success(t('settings_updated'));
    if (key === 'language') {
      changeLanguage(value);
    }
  };

  const tabs = [
    { id: 'notifications', label: t('notification_prefs'), icon: FaBell },
    { id: 'security', label: t('security_privacy'), icon: FaShieldAlt },
    { id: 'appearance', label: t('appearance_settings'), icon: FaPalette },
    { id: 'localization', label: t('localization'), icon: FaGlobe },
  ];

  return (
    <AnimatedPage>
      <div className='min-h-screen pt-28 pb-10 px-4 max-w-6xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-extrabold text-slate-900'>{t('app_settings')}</h1>
          <p className='text-slate-500 font-light mt-1'>{t('manage_prefs')}</p>
        </div>

        <div className='flex flex-col md:flex-row gap-8'>
          
          {/* Settings Sidebar */}
          <div className='w-full md:w-64 flex-shrink-0'>
            <div className='bg-white border border-slate-100 rounded-3xl p-4 shadow-sm flex flex-col gap-2'>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={isActive ? 'text-indigo-600' : 'text-slate-400'} size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings Content Area */}
          <div className='flex-1'>
            <div className='bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm min-h-[400px]'>
              
              {activeTab === 'notifications' && (
                <div className='animate-fade-in'>
                  <h2 className='text-xl font-bold text-slate-900 mb-6'>{t('notification_prefs')}</h2>
                  <div className='flex flex-col gap-6'>
                    <ToggleOption 
                      title={t('email_alerts')} 
                      description={t('email_alerts_desc')}
                      checked={settings.emailAlerts}
                      onChange={() => handleToggle('emailAlerts')}
                    />
                    <div className='w-full h-px bg-slate-100'></div>
                    <ToggleOption 
                      title={t('booking_reminders')} 
                      description={t('booking_reminders_desc')}
                      checked={settings.bookingReminders}
                      onChange={() => handleToggle('bookingReminders')}
                    />
                    <div className='w-full h-px bg-slate-100'></div>
                    <ToggleOption 
                      title={t('promo_marketing')} 
                      description={t('promo_marketing_desc')}
                      checked={settings.marketingEmails}
                      onChange={() => handleToggle('marketingEmails')}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className='animate-fade-in'>
                  <h2 className='text-xl font-bold text-slate-900 mb-6'>{t('security_privacy')}</h2>
                  <div className='flex flex-col gap-6'>
                    <ToggleOption 
                      title={t('two_factor')} 
                      description={t('two_factor_desc')}
                      checked={settings.twoFactorAuth}
                      onChange={() => handleToggle('twoFactorAuth')}
                    />
                    <div className='w-full h-px bg-slate-100'></div>
                    <ToggleOption 
                      title={t('login_alerts')} 
                      description={t('login_alerts_desc')}
                      checked={settings.loginAlerts}
                      onChange={() => handleToggle('loginAlerts')}
                    />
                    <div className='w-full h-px bg-slate-100'></div>
                    <div className='bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-center justify-between'>
                       <div>
                         <p className='font-bold text-indigo-900 text-sm'>{t('password_mgmt')}</p>
                         <p className='text-xs text-indigo-700 mt-1 max-w-sm'>{t('password_mgmt_desc')}</p>
                       </div>
                       <button onClick={() => window.location.href='/profile'} className='bg-white text-indigo-600 px-4 py-2 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors'>
                         {t('edit_profile')}
                       </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className='animate-fade-in'>
                  <h2 className='text-xl font-bold text-slate-900 mb-6'>{t('appearance_settings')}</h2>
                  <div className='grid grid-cols-2 gap-4'>
                    <button 
                      onClick={() => { dispatch(setTheme('light')); toast.success(t('theme_updated')); }}
                      className={`relative border-2 rounded-2xl p-4 flex flex-col items-center gap-3 transition-colors ${theme === 'light' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      {theme === 'light' && <div className='absolute top-3 right-3 bg-indigo-600 rounded-full p-1'><FaCheck className='text-white text-[10px]' /></div>}
                      <div className='w-24 h-16 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col'>
                         <div className='h-4 border-b border-slate-100 bg-slate-50'></div>
                         <div className='flex-1 flex gap-2 p-2'>
                           <div className='w-4 h-full bg-slate-100 rounded'></div>
                           <div className='flex-1 h-full bg-slate-50 rounded'></div>
                         </div>
                      </div>
                      <span className='font-semibold text-slate-700'>{t('light_mode')}</span>
                    </button>

                    <button 
                      onClick={() => { dispatch(setTheme('dark')); toast.success(t('theme_updated')); }}
                      className={`relative border-2 rounded-2xl p-4 flex flex-col items-center gap-3 transition-colors ${theme === 'dark' ? 'border-indigo-600 bg-slate-800' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      {theme === 'dark' && <div className='absolute top-3 right-3 bg-indigo-600 rounded-full p-1'><FaCheck className='text-white text-[10px]' /></div>}
                      <div className='w-24 h-16 bg-slate-800 border border-slate-700 rounded-lg shadow-sm flex flex-col'>
                         <div className='h-4 border-b border-slate-700 bg-slate-900'></div>
                         <div className='flex-1 flex gap-2 p-2'>
                           <div className='w-4 h-full bg-slate-700 rounded'></div>
                           <div className='flex-1 h-full bg-slate-900 rounded'></div>
                         </div>
                      </div>
                      <span className='font-semibold text-slate-700'>{t('dark_mode')}</span>
                    </button>
                  </div>
                  <p className='text-xs text-slate-400 mt-4 text-center'>Note: System dark mode implementation is currently in beta.</p>
                </div>
              )}

              {activeTab === 'localization' && (
                <div className='animate-fade-in'>
                  <h2 className='text-xl font-bold text-slate-900 mb-6'>{t('localization')}</h2>
                  <div className='flex flex-col gap-6'>
                    <div>
                      <label className='block text-sm font-semibold text-slate-700 mb-2'>{t('display_language')}</label>
                      <select 
                        value={settings.language} 
                        onChange={(e) => handleSelectChange('language', e.target.value)}
                        className='w-full max-w-md px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all text-sm text-slate-700'
                      >
                        <option value="en">English (US)</option>
                        <option value="fr">Français</option>
                        <option value="ar">العربية</option>
                        <option value="gr">Deutsch</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </AnimatedPage>
  );
}

// Reusable Toggle Component
function ToggleOption({ title, description, checked, onChange }) {
  return (
    <div className='flex items-center justify-between gap-4'>
      <div>
        <h3 className='font-semibold text-slate-800 text-sm'>{title}</h3>
        <p className='text-xs text-slate-500 mt-1 max-w-sm leading-relaxed'>{description}</p>
      </div>
      <button 
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${checked ? 'bg-indigo-600' : 'bg-slate-300'}`}
      >
        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
      </button>
    </div>
  );
}
