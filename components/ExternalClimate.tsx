
import React from 'react';
import { ExternalWeather } from '../types';
import { StatCard } from './StatCard';
import { Sun, Wind, Thermometer, Compass } from 'lucide-react';

interface ExternalClimateProps {
  weather: ExternalWeather;
}

export const ExternalClimate: React.FC<ExternalClimateProps> = ({ weather }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Sun className="text-yellow-500" />
          Метеостанция (Внешний контур)
        </h2>
        <p className="text-slate-400 mt-2">Данные с уличных датчиков в реальном времени.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Температура (Улица)" 
          value={weather.temperature.toFixed(1)} 
          unit="°C" 
          icon={Thermometer} 
          color="text-orange-400" 
        />
        <StatCard 
          title="Радиация" 
          value={weather.solarRadiation.toFixed(0)} 
          unit="Вт/м²" 
          icon={Sun} 
          color="text-yellow-400" 
        />
        <StatCard 
          title="Скорость ветра" 
          value={weather.windSpeed.toFixed(1)} 
          unit="м/с" 
          icon={Wind} 
          color="text-blue-300" 
        />
        <StatCard 
          title="Направление" 
          value={weather.windDirection} 
          unit="" 
          icon={Compass} 
          color="text-slate-300" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Сводка погоды</h3>
          <div className="text-slate-300 space-y-2">
            <p>Сейчас на улице <strong>{weather.temperature > 0 ? 'тепло' : 'холодно'}</strong>.</p>
            <p>Ветер <strong>{weather.windSpeed < 5 ? 'слабый' : 'сильный'}</strong>, направление <strong>{weather.windDirection}</strong>.</p>
            <p>Уровень солнечной радиации: <strong>{weather.solarRadiation > 500 ? 'Высокий' : 'Низкий/Умеренный'}</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
