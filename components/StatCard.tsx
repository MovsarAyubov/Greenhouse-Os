import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  color: string; // Tailwind text color class, e.g., 'text-red-500'
  trend?: 'up' | 'down' | 'stable';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, unit, icon: Icon, color }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg flex items-center justify-between transition-transform hover:scale-[1.02]">
      <div>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline mt-2">
          <span className={`text-3xl font-bold ${color}`}>{value}</span>
          <span className="ml-1 text-slate-500 text-sm">{unit}</span>
        </div>
      </div>
      <div className={`p-3 rounded-full bg-slate-700/50 ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};