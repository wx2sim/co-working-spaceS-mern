import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

/**
 * A premium analytics chart component using Recharts.
 * Supports both Area (AreaChart) and Bar (BarChart) types.
 */
export default function AnalyticsChart({ data, type = 'area', dataKey = 'income', color = '#4f46e5', title }) {
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-sm font-extrabold text-slate-900">
            {dataKey === 'income' ? `${payload[0].value.toLocaleString()} DA` : payload[0].value}
            <span className="text-[10px] font-medium text-slate-400 ml-1">
              {dataKey === 'income' ? 'Revenue' : 'New Users'}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className='bg-white border border-slate-100 rounded-3xl p-6 shadow-sm h-full flex flex-col'>
      {title && (
        <div className='flex items-center justify-between mb-8'>
          <h3 className='text-sm font-extrabold text-slate-800 uppercase tracking-wider'>{title}</h3>
          <div className='flex gap-2'>
             <div className='w-2 h-2 rounded-full' style={{ backgroundColor: color }}></div>
             <span className='text-[10px] font-bold text-slate-400 uppercase'>{dataKey}</span>
          </div>
        </div>
      )}
      
      <div className='flex-1 min-h-[250px] w-full'>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="_id" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                tickFormatter={(value) => dataKey === 'income' ? `${value >= 1000 ? (value/1000).toFixed(1)+'k' : value}` : value}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }} />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorGradient)" 
                animationDuration={1500}
              />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="_id" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar 
                dataKey={dataKey} 
                radius={[6, 6, 0, 0]}
                barSize={32}
                animationDuration={1500}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === data.length - 1 ? color : '#e2e8f0'} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
