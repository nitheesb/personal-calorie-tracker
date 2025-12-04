import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface MacroRingProps {
  current: number;
  max: number;
  color: string;
  label: string;
  unit: string;
}

const MacroRing: React.FC<MacroRingProps> = ({ current, max, color, label, unit }) => {
  const data = [
    { name: 'Progress', value: current > max ? max : current },
    { name: 'Remaining', value: Math.max(0, max - current) },
  ];

  const percentage = Math.round((current / max) * 100);

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative w-24 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={45}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              <Cell key="progress" fill={color} />
              <Cell key="remaining" fill="#e2e8f0" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-bold text-slate-700">{current}</span>
          <span className="text-[10px] text-slate-400">/ {max}{unit}</span>
        </div>
      </div>
      <span className="mt-1 text-xs font-medium text-slate-600">{label}</span>
    </div>
  );
};

export default MacroRing;