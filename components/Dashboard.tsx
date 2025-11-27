
import React from 'react';
import { GreenhouseBlock } from '../types';
import { StatCard } from './StatCard';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Sun, 
  Flame, 
  Blinds, 
  Fan 
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface DashboardProps {
  block: GreenhouseBlock;
}

export const Dashboard: React.FC<DashboardProps> = ({ block }) => {
  const { sensors, devices, history } = block;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Температура" 
          value={sensors.temperature.toFixed(1)} 
          unit="°C" 
          icon={Thermometer} 
          color={sensors.temperature > block.config.ventOpenThreshold ? "text-red-400" : "text-emerald-400"} 
        />
        <StatCard 
          title="Влажность" 
          value={sensors.humidity.toFixed(1)} 
          unit="%" 
          icon={Droplets} 
          color="text-blue-400" 
        />
        <StatCard 
          title="Влажность почвы" 
          value={sensors.soilMoisture.toFixed(0)} 
          unit="%" 
          icon={Wind} 
          color="text-amber-400" 
        />
        <StatCard 
          title="Освещенность" 
          value={sensors.lightLevel.toFixed(0)} 
          unit="lux" 
          icon={Sun} 
          color="text-yellow-400" 
        />
      </div>

      {/* Device Status & Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Device Status Panel */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Оборудование: {block.name}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Flame className={devices.heater ? "text-red-500" : "text-slate-500"} />
                <span className="text-slate-200">Отопление (Котел)</span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${devices.heater ? "bg-red-500/20 text-red-400" : "bg-slate-600 text-slate-400"}`}>
                {devices.heater ? "ВКЛ" : "ВЫКЛ"}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Wind className={devices.vents ? "text-blue-500" : "text-slate-500"} />
                <span className="text-slate-200">Форточки</span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${devices.vents ? "bg-blue-500/20 text-blue-400" : "bg-slate-600 text-slate-400"}`}>
                {devices.vents ? "ОТКРЫТЫ" : "ЗАКРЫТЫ"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Blinds className={devices.curtains ? "text-purple-500" : "text-slate-500"} />
                <span className="text-slate-200">Шторы</span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${devices.curtains ? "bg-purple-500/20 text-purple-400" : "bg-slate-600 text-slate-400"}`}>
                {devices.curtains ? "ЗАКРЫТЫ" : "ОТКРЫТЫ"}
              </span>
            </div>
             
             {/* Integrated Irrigation Status */}
             <div className="p-3 bg-slate-700/30 rounded-lg space-y-2">
               <div className="flex items-center gap-3 mb-2">
                  <Fan className={(devices.irrigationValveA || devices.irrigationValveB) ? "text-cyan-500" : "text-slate-500"} />
                  <span className="text-slate-200">Полив</span>
               </div>
               <div className="grid grid-cols-2 gap-2">
                 <div className={`text-xs text-center py-1 rounded border ${devices.irrigationValveA ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>
                   Кран А {devices.irrigationValveA ? 'ON' : 'OFF'}
                 </div>
                 <div className={`text-xs text-center py-1 rounded border ${devices.irrigationValveB ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>
                   Кран B {devices.irrigationValveB ? 'ON' : 'OFF'}
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg min-h-[300px]">
          <h3 className="text-lg font-semibold text-white mb-4">График климата: {block.name}</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="temp" 
                  name="Темп. (°C)" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorTemp)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="humidity" 
                  name="Влажность (%)" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorHum)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
