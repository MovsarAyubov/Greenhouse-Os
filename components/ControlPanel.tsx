import React from 'react';
import { BlockConfig } from '../types';
import { Settings, Save, Power } from 'lucide-react';

interface ControlPanelProps {
  config: BlockConfig;
  blockName: string;
  onConfigChange: (newConfig: BlockConfig) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, blockName, onConfigChange }) => {
  const handleChange = (key: keyof BlockConfig, value: number | boolean) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="text-blue-500" />
              Настройки: {blockName}
            </h2>
            <p className="text-slate-400 text-sm mt-1">Параметры применяются только к этому блоку</p>
          </div>
          
          <button 
            onClick={() => handleChange('autoMode', !config.autoMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              config.autoMode 
                ? 'bg-green-600 hover:bg-green-500 text-white' 
                : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
            }`}
          >
            <Power size={18} />
            {config.autoMode ? 'АВТОМАТИКА ВКЛ' : 'РУЧНОЙ РЕЖИМ'}
          </button>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity ${config.autoMode ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          {/* Temperature Control */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-blue-300 border-b border-slate-700 pb-2">Климат контроль</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="text-slate-300">Целевая Температура (День)</label>
                <span className="text-white font-bold">{config.targetTempDay}°C</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="35" 
                step="0.5"
                value={config.targetTempDay}
                onChange={(e) => handleChange('targetTempDay', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="text-slate-300">Целевая Температура (Ночь)</label>
                <span className="text-white font-bold">{config.targetTempNight}°C</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="30" 
                step="0.5"
                value={config.targetTempNight}
                onChange={(e) => handleChange('targetTempNight', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          {/* Actuator Thresholds */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-emerald-300 border-b border-slate-700 pb-2">Исполнительные механизмы</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="text-slate-300">Включение отопления при</label>
                <span className="text-red-400 font-bold">&lt; {config.heaterStartThreshold}°C</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="25" 
                step="1"
                value={config.heaterStartThreshold}
                onChange={(e) => handleChange('heaterStartThreshold', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <p className="text-xs text-slate-500">Котел включится, если температура упадет ниже этого значения.</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="text-slate-300">Открытие форточек при</label>
                <span className="text-blue-400 font-bold">&gt; {config.ventOpenThreshold}°C</span>
              </div>
              <input 
                type="range" 
                min="15" 
                max="40" 
                step="1"
                value={config.ventOpenThreshold}
                onChange={(e) => handleChange('ventOpenThreshold', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
               <p className="text-xs text-slate-500">Форточки откроются для охлаждения при превышении.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
           <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition-colors font-medium">
             <Save size={18} />
             Применить настройки
           </button>
        </div>
      </div>
    </div>
  );
};
