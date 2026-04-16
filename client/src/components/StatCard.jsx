import React from 'react';

export default function StatCard({ title, value, icon: Icon, colorClass = 'bg-slate-900', trend, trendValue }) {
  return (
    <div className='bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow'>
      <div className='flex items-center justify-between mb-4'>
        <div className={`w-12 h-12 ${colorClass} rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/10`}>
          <Icon className='text-white text-xl' />
        </div>
        {trend && (
           <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
           </div>
        )}
      </div>
      <div>
        <p className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-1'>{title}</p>
        <h3 className='text-2xl font-black text-slate-900 tracking-tight'>{value}</h3>
      </div>
    </div>
  );
}
