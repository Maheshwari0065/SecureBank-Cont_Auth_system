import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const data = [
  { name: 'Oct', amount: 45000 },
  { name: 'Nov', amount: 52000 },
  { name: 'Dec', amount: 38000 },
  { name: 'Jan', amount: 65000 },
  { name: 'Feb', amount: 48000 },
  { name: 'Mar', amount: 59000 },
];

const SpendingChart = () => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          <XAxis 
             dataKey="name" 
             axisLine={false} 
             tickLine={false} 
             tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700, fontFamily: 'Fira Code, monospace' }} 
          />
          <YAxis 
             axisLine={false} 
             tickLine={false} 
             tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700, fontFamily: 'Fira Code, monospace' }}
             tickFormatter={(value) => `₹${value/1000}k`}
          />
          <Tooltip 
             contentStyle={{ 
               backgroundColor: '#090d16', 
               borderRadius: '12px', 
               border: '1px solid #1e293b', 
               fontSize: '12px', 
               color: '#f8fafc',
               fontFamily: 'Fira Code, monospace',
               boxShadow: '0 0 15px rgba(0, 242, 254, 0.25)'
             }}
             cursor={{ fill: 'rgba(30, 41, 59, 0.4)' }}
          />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={28}>
            {data.map((entry, index) => (
              <Cell 
                 key={`cell-${index}`} 
                 fill={index === data.length - 1 ? '#00f2fe' : 'rgba(0, 242, 254, 0.15)'} 
                 stroke={index === data.length - 1 ? '#00f2fe' : 'rgba(0, 242, 254, 0.3)'}
                 strokeWidth={1}
                 className="transition-all duration-500 hover:fill-primary-dark cursor-pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendingChart;
