import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedPage from '../../components/AnimatedPage';

// SVG illustrations for each error type
const illustrations = {
  404: (
    <svg viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px]">
      {/* Floating document with question mark */}
      <rect x="90" y="40" width="100" height="130" rx="12" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2"/>
      <rect x="110" y="60" width="60" height="6" rx="3" fill="#cbd5e1"/>
      <rect x="110" y="76" width="45" height="6" rx="3" fill="#cbd5e1"/>
      <rect x="110" y="92" width="55" height="6" rx="3" fill="#cbd5e1"/>
      <rect x="110" y="108" width="30" height="6" rx="3" fill="#e2e8f0"/>
      {/* Question mark */}
      <text x="140" y="155" textAnchor="middle" fontSize="36" fontWeight="800" fill="#94a3b8" fontFamily="sans-serif">?</text>
      {/* Floating dots */}
      <circle cx="60" cy="70" r="6" fill="#e2e8f0" opacity="0.7">
        <animate attributeName="cy" values="70;60;70" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="230" cy="100" r="4" fill="#e2e8f0" opacity="0.5">
        <animate attributeName="cy" values="100;90;100" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="50" cy="140" r="3" fill="#e2e8f0" opacity="0.4">
        <animate attributeName="cy" values="140;132;140" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="240" cy="60" r="5" fill="#e2e8f0" opacity="0.6">
        <animate attributeName="cy" values="60;52;60" dur="3.5s" repeatCount="indefinite"/>
      </circle>
      {/* Magnifying glass */}
      <circle cx="200" cy="150" r="18" stroke="#94a3b8" strokeWidth="3" fill="none" opacity="0.5">
        <animate attributeName="r" values="18;20;18" dur="2s" repeatCount="indefinite"/>
      </circle>
      <line x1="213" y1="163" x2="228" y2="178" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  401: (
    <svg viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px]">
      {/* Lock body */}
      <rect x="100" y="100" width="80" height="70" rx="12" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2"/>
      {/* Lock shackle */}
      <path d="M120 100 V75 C120 55 160 55 160 75 V100" stroke="#94a3b8" strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* Keyhole */}
      <circle cx="140" cy="130" r="8" fill="#94a3b8"/>
      <rect x="137" y="133" width="6" height="16" rx="3" fill="#94a3b8"/>
      {/* Shield badge */}
      <path d="M60 60 L60 90 Q60 110 80 115 Q100 110 100 90 L100 60 Z" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2"/>
      <text x="80" y="95" textAnchor="middle" fontSize="24" fill="#94a3b8" fontFamily="sans-serif">!</text>
      {/* Floating dots */}
      <circle cx="220" cy="70" r="5" fill="#e2e8f0" opacity="0.6">
        <animate attributeName="cy" values="70;62;70" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="45" cy="130" r="4" fill="#e2e8f0" opacity="0.4">
        <animate attributeName="cy" values="130;122;130" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="240" cy="150" r="3" fill="#e2e8f0" opacity="0.5">
        <animate attributeName="cy" values="150;143;150" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  ),
  403: (
    <svg viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px]">
      {/* Stop sign / barrier */}
      <rect x="60" y="120" width="160" height="12" rx="6" fill="#fecaca" opacity="0.7"/>
      <rect x="60" y="90" width="160" height="12" rx="6" fill="#fca5a5" opacity="0.5"/>
      {/* Pole */}
      <rect x="70" y="80" width="6" height="100" rx="3" fill="#e2e8f0"/>
      <rect x="204" y="80" width="6" height="100" rx="3" fill="#e2e8f0"/>
      {/* Shield with X */}
      <path d="M115 30 L115 65 Q115 85 140 92 Q165 85 165 65 L165 30 Z" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2"/>
      <line x1="128" y1="48" x2="152" y2="72" stroke="#f87171" strokeWidth="3" strokeLinecap="round"/>
      <line x1="152" y1="48" x2="128" y2="72" stroke="#f87171" strokeWidth="3" strokeLinecap="round"/>
      {/* Floating particles */}
      <circle cx="40" cy="60" r="4" fill="#fecaca" opacity="0.5">
        <animate attributeName="cy" values="60;52;60" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="245" cy="55" r="5" fill="#e2e8f0" opacity="0.5">
        <animate attributeName="cy" values="55;47;55" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="40" cy="160" r="3" fill="#e2e8f0" opacity="0.4">
        <animate attributeName="cy" values="160;153;160" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  ),
  500: (
    <svg viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px]">
      {/* Server rack */}
      <rect x="90" y="40" width="100" height="140" rx="10" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2"/>
      {/* Server slots */}
      <rect x="105" y="55" width="70" height="20" rx="4" fill="#e2e8f0"/>
      <rect x="105" y="85" width="70" height="20" rx="4" fill="#e2e8f0"/>
      <rect x="105" y="115" width="70" height="20" rx="4" fill="#e2e8f0"/>
      {/* LEDs - one blinking red */}
      <circle cx="115" cy="65" r="3" fill="#86efac"/>
      <circle cx="125" cy="65" r="3" fill="#86efac"/>
      <circle cx="115" cy="95" r="3" fill="#f87171">
        <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
      </circle>
      <circle cx="125" cy="95" r="3" fill="#f87171">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="115" cy="125" r="3" fill="#fbbf24"/>
      <circle cx="125" cy="125" r="3" fill="#86efac"/>
      {/* Warning triangle */}
      <path d="M200 60 L220 95 L180 95 Z" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinejoin="round"/>
      <text x="200" y="90" textAnchor="middle" fontSize="18" fontWeight="800" fill="#fbbf24" fontFamily="sans-serif">!</text>
      {/* Smoke/particles */}
      <circle cx="60" cy="80" r="5" fill="#e2e8f0" opacity="0.5">
        <animate attributeName="cy" values="80;65;80" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="240" cy="130" r="4" fill="#e2e8f0" opacity="0.4">
        <animate attributeName="cy" values="130;118;130" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="55" cy="155" r="3" fill="#e2e8f0" opacity="0.3">
        <animate attributeName="cy" values="155;145;155" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  ),
  503: (
    <svg viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px]">
      {/* Gear 1 */}
      <g transform="translate(110, 100)">
        <animateTransform attributeName="transform" type="rotate" from="0 110 100" to="360 110 100" dur="6s" repeatCount="indefinite" additive="sum"/>
        <circle cx="0" cy="0" r="24" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2"/>
        <circle cx="0" cy="0" r="10" fill="#e2e8f0"/>
        {/* Teeth */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <rect key={i} x="-4" y="-30" width="8" height="12" rx="2" fill="#e2e8f0" transform={`rotate(${angle})`}/>
        ))}
      </g>
      {/* Gear 2 */}
      <g transform="translate(170, 80)">
        <animateTransform attributeName="transform" type="rotate" from="360 170 80" to="0 170 80" dur="6s" repeatCount="indefinite" additive="sum"/>
        <circle cx="0" cy="0" r="18" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2"/>
        <circle cx="0" cy="0" r="7" fill="#e2e8f0"/>
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <rect key={i} x="-3.5" y="-23" width="7" height="10" rx="2" fill="#e2e8f0" transform={`rotate(${angle})`}/>
        ))}
      </g>
      {/* Wrench */}
      <g opacity="0.5">
        <rect x="60" y="140" width="50" height="6" rx="3" fill="#94a3b8" transform="rotate(-30 60 140)"/>
        <circle cx="52" cy="148" r="10" stroke="#94a3b8" strokeWidth="3" fill="none"/>
      </g>
      {/* Clock */}
      <circle cx="220" cy="150" r="18" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2"/>
      <line x1="220" y1="150" x2="220" y2="138" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
      <line x1="220" y1="150" x2="230" y2="150" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="220" cy="150" r="2" fill="#94a3b8"/>
      {/* Particles */}
      <circle cx="45" cy="70" r="4" fill="#e2e8f0" opacity="0.5">
        <animate attributeName="cy" values="70;62;70" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="250" cy="90" r="3" fill="#e2e8f0" opacity="0.4">
        <animate attributeName="cy" values="90;83;90" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  ),
  408: (
    <svg viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px]">
      {/* Hourglass */}
      <path d="M105 50 L175 50 L145 110 L175 170 L105 170 L135 110 Z" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2" strokeLinejoin="round"/>
      {/* Top sand */}
      <path d="M120 60 L160 60 L143 95 L137 95 Z" fill="#fde68a" opacity="0.6"/>
      {/* Bottom sand */}
      <path d="M115 160 L165 160 L145 125 L135 125 Z" fill="#fde68a" opacity="0.8"/>
      {/* Falling sand */}
      <circle cx="140" cy="108" r="2" fill="#fbbf24" opacity="0.7">
        <animate attributeName="cy" values="100;120;100" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;0;0.7" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      {/* Stand */}
      <rect x="95" y="45" width="90" height="4" rx="2" fill="#e2e8f0"/>
      <rect x="95" y="171" width="90" height="4" rx="2" fill="#e2e8f0"/>
      {/* X mark */}
      <line x1="200" y1="65" x2="230" y2="95" stroke="#f87171" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
      <line x1="230" y1="65" x2="200" y2="95" stroke="#f87171" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
      {/* Floating dots */}
      <circle cx="55" cy="80" r="5" fill="#e2e8f0" opacity="0.5">
        <animate attributeName="cy" values="80;72;80" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="250" cy="140" r="4" fill="#e2e8f0" opacity="0.4">
        <animate attributeName="cy" values="140;133;140" dur="2.5s" repeatCount="indefinite"/>
      </circle>
    </svg>
  ),
  429: (
    <svg viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px]">
      {/* Speed gauge */}
      <path d="M80 150 A70 70 0 0 1 200 150" stroke="#e2e8f0" strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d="M80 150 A70 70 0 0 1 180 90" stroke="#f87171" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.7"/>
      {/* Needle */}
      <line x1="140" y1="150" x2="175" y2="100" stroke="#1e293b" strokeWidth="3" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" values="0 140 150;15 140 150;0 140 150" dur="2s" repeatCount="indefinite"/>
      </line>
      <circle cx="140" cy="150" r="6" fill="#1e293b"/>
      {/* Lightning bolts */}
      <path d="M60 50 L55 70 L65 65 L58 85" stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite"/>
      </path>
      <path d="M225 45 L220 65 L230 60 L223 80" stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.8s" repeatCount="indefinite"/>
      </path>
      {/* Particles */}
      <circle cx="50" cy="120" r="4" fill="#e2e8f0" opacity="0.5">
        <animate attributeName="cy" values="120;112;120" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="240" cy="130" r="3" fill="#e2e8f0" opacity="0.4">
        <animate attributeName="cy" values="130;123;130" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  ),
};

// Error metadata for all supported status codes
const errorConfig = {
  400: {
    title: 'Bad Request',
    description: 'The server could not understand your request. Please check your input and try again.',
    gradient: 'from-amber-500 to-orange-500',
    bgAccent: 'bg-amber-50',
    borderAccent: 'border-amber-100',
    textAccent: 'text-amber-600',
  },
  401: {
    title: 'Unauthorized',
    description: 'You need to sign in to access this page. Please log in and try again.',
    gradient: 'from-indigo-500 to-violet-500',
    bgAccent: 'bg-indigo-50',
    borderAccent: 'border-indigo-100',
    textAccent: 'text-indigo-600',
    actionText: 'Sign In',
    actionLink: '/signin',
  },
  403: {
    title: 'Access Denied',
    description: 'You don\'t have permission to access this resource. Contact an administrator if you believe this is a mistake.',
    gradient: 'from-red-500 to-rose-500',
    bgAccent: 'bg-red-50',
    borderAccent: 'border-red-100',
    textAccent: 'text-red-500',
  },
  404: {
    title: 'Page Not Found',
    description: 'The page you\'re looking for doesn\'t exist or has been moved. Let\'s get you back on track.',
    gradient: 'from-slate-500 to-slate-700',
    bgAccent: 'bg-slate-50',
    borderAccent: 'border-slate-100',
    textAccent: 'text-slate-500',
  },
  408: {
    title: 'Request Timeout',
    description: 'The server took too long to respond. Please check your connection and try again.',
    gradient: 'from-yellow-500 to-amber-500',
    bgAccent: 'bg-yellow-50',
    borderAccent: 'border-yellow-100',
    textAccent: 'text-yellow-600',
  },
  429: {
    title: 'Too Many Requests',
    description: 'You\'ve sent too many requests in a short period. Please slow down and try again in a moment.',
    gradient: 'from-orange-500 to-red-500',
    bgAccent: 'bg-orange-50',
    borderAccent: 'border-orange-100',
    textAccent: 'text-orange-500',
  },
  500: {
    title: 'Server Error',
    description: 'Something went wrong on our end. Our team has been notified and we\'re working to fix it.',
    gradient: 'from-red-600 to-rose-600',
    bgAccent: 'bg-red-50',
    borderAccent: 'border-red-100',
    textAccent: 'text-red-500',
  },
  503: {
    title: 'Service Unavailable',
    description: 'We\'re currently performing maintenance. Please check back shortly — we\'ll be up and running soon.',
    gradient: 'from-blue-500 to-cyan-500',
    bgAccent: 'bg-blue-50',
    borderAccent: 'border-blue-100',
    textAccent: 'text-blue-500',
  },
};

// Get the best matching illustration
function getIllustration(code) {
  if (illustrations[code]) return illustrations[code];
  if (code >= 400 && code < 500) return illustrations[404];
  return illustrations[500];
}

// Get the best matching config
function getConfig(code) {
  if (errorConfig[code]) return errorConfig[code];
  if (code >= 400 && code < 500) {
    return {
      ...errorConfig[400],
      title: `Error ${code}`,
    };
  }
  return {
    ...errorConfig[500],
    title: `Error ${code}`,
  };
}

export default function ErrorPage({ statusCode = 404, message }) {
  const navigate = useNavigate();
  const config = getConfig(statusCode);
  const illustration = getIllustration(statusCode);
  const displayMessage = message || config.description;

  return (
    <AnimatedPage>
      <div className='min-h-screen pt-28 pb-10 px-4 flex items-center justify-center'>
        <div className='bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden max-w-lg w-full'>

          {/* Top gradient strip */}
          <div className={`h-1.5 bg-gradient-to-r ${config.gradient}`}></div>

          <div className='p-8 sm:p-10 flex flex-col items-center text-center'>

            {/* SVG Illustration */}
            <div className='mb-6'>
              {illustration}
            </div>

            {/* Status Code */}
            <span className={`text-6xl font-extrabold tracking-tighter bg-gradient-to-r ${config.gradient} text-transparent bg-clip-text mb-2`}>
              {statusCode}
            </span>

            {/* Title */}
            <h1 className='text-2xl font-extrabold text-slate-900 mb-3'>
              {config.title}
            </h1>

            {/* Description */}
            <p className='text-slate-500 font-light text-sm leading-relaxed max-w-sm mb-8'>
              {displayMessage}
            </p>

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs'>
              {config.actionLink ? (
                <Link
                  to={config.actionLink}
                  className='w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-all duration-300 text-sm text-center'
                >
                  {config.actionText}
                </Link>
              ) : (
                <button
                  onClick={() => navigate(-1)}
                  className='w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-all duration-300 text-sm'
                >
                  Go Back
                </button>
              )}
              <Link
                to='/'
                className='w-full bg-slate-50 border border-slate-200 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-100 transition-all duration-300 text-sm text-center'
              >
                Home
              </Link>
            </div>

            {/* Subtle info card */}
            <div className={`mt-8 w-full ${config.bgAccent} border ${config.borderAccent} rounded-xl px-4 py-3`}>
              <p className={`text-xs ${config.textAccent} font-medium`}>
                Error Code: {statusCode} • If this issue persists, please contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
