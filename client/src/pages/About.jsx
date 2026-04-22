import React from 'react';
import AnimatedPage from '../components/AnimatedPage';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const { t } = useLanguage();
  useDocumentTitle(`${t('about')} | Co-Spaces`);
  
  return (
    <AnimatedPage>
      <div className='min-h-screen pt-28 pb-20 px-4 max-w-6xl mx-auto'>
        <div className='text-center max-w-3xl mx-auto mb-16'>
          <h1 className='text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight'>
            {t('about_hero_1')} <span className='text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500'>{t('about_hero_2')}</span> {t('about_hero_3')}
          </h1>
          <p className='text-lg text-slate-500 leading-relaxed font-light'>
            {t('about_hero_p')}
          </p>
        </div>
        <div className='grid md:grid-cols-2 gap-10 mb-20 items-center'>
          <div className='rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 relative group h-[400px]'>
            <img 
              src='https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop' 
              alt='Modern Co-working Space' 
              className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700'
            />
            <div className='absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-700'></div>
          </div>
          <div className='flex flex-col gap-8'>
            <div>
              <h2 className='text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2'>
                <span className='w-8 h-[2px] bg-slate-900 inline-block'></span> {t('about_mission_title')}
              </h2>
              <p className='text-slate-600 leading-relaxed'>
                {t('about_mission_p')}
              </p>
            </div>
            
            <div>
              <h2 className='text-2xl font-bold text-slate-900 mb-3 flex items-center gap-2'>
                <span className='w-8 h-[2px] bg-slate-900 inline-block'></span> {t('about_why_title')}
              </h2>
              <p className='text-slate-600 leading-relaxed'>
                {t('about_why_p')}
              </p>
            </div>
          </div>
        </div>
        <div className='bg-slate-900 rounded-3xl p-10 sm:p-16 text-white grid grid-cols-1 md:grid-cols-3 gap-10 text-center mb-16 shadow-xl'>
          <div className='flex flex-col items-center justify-center'>
            <span className='text-4xl md:text-5xl font-extrabold mb-2'>50+</span>
            <span className='text-slate-400 font-medium uppercase tracking-wider text-sm'>{t('stats_spaces')}</span>
          </div>
          <div className='flex flex-col items-center justify-center md:border-x border-slate-700'>
            <span className='text-4xl md:text-5xl font-extrabold mb-2'>1000+</span>
            <span className='text-slate-400 font-medium uppercase tracking-wider text-sm'>{t('stats_clients')}</span>
          </div>
          <div className='flex flex-col items-center justify-center'>
            <span className='text-4xl md:text-5xl font-extrabold mb-2'>24/7</span>
            <span className='text-slate-400 font-medium uppercase tracking-wider text-sm'>{t('stats_support')}</span>
          </div>
        </div>
        <div className='text-center bg-slate-50 border border-slate-100 rounded-3xl p-10'>
          <h3 className='text-2xl font-bold text-slate-900 mb-4'>{t('about_cta_title')}</h3>
          <p className='text-slate-500 mb-8 max-w-2xl mx-auto'>
            {t('about_cta_p')}
          </p>
          <Link 
            to='/search' 
            className='inline-block bg-slate-900 text-white px-8 py-4 rounded-full font-semibold hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200'
          >
            {t('explore_workspaces_now')}
          </Link>
        </div>

      </div>
    </AnimatedPage>
  );
}