
import React, { useState } from 'react';
import { GreenhouseBlock, IrrigationConfig } from '../types';
import { Droplets, Beaker, Zap, Settings2, Clock, Plus, Trash2, Play, Square, Activity, Timer, Hourglass } from 'lucide-react';

interface IrrigationPanelProps {
  block: GreenhouseBlock;
  queuePosition: number; // -1 if not in queue
  onConfigChange: (newIrrigationConfig: IrrigationConfig) => void;
  onStartManual: () => void;
  onStopManual: () => void;
}

export const IrrigationPanel: React.FC<IrrigationPanelProps> = ({ block, queuePosition, onConfigChange, onStartManual, onStopManual }) => {
  const { config, sensors, devices, irrigationProcess } = block;
  const { irrigation } = config;
  
  // Local state for adding schedule
  const [newTime, setNewTime] = useState("08:00");

  const handleChange = (key: keyof IrrigationConfig, value: any) => {
    onConfigChange({ ...irrigation, [key]: value });
  };

  const handleAddSchedule = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newSchedule = [...irrigation.schedule, { id: newId, startTime: newTime, enabled: true }];
    handleChange('schedule', newSchedule);
  };

  const handleRemoveSchedule = (id: string) => {
    const newSchedule = irrigation.schedule.filter(s => s.id !== id);
    handleChange('schedule', newSchedule);
  };

  // Calculations for Config
  const totalArea = irrigation.valveAArea + irrigation.valveBArea;
  const drippersA = totalArea > 0 ? (irrigation.valveAArea / totalArea) * irrigation.totalDrippers : 0;
  const drippersB = totalArea > 0 ? (irrigation.valveBArea / totalArea) * irrigation.totalDrippers : 0;
  
  const configVolumeA = (drippersA * irrigation.targetVolumePerDripper) / 1000;
  const configVolumeB = (drippersB * irrigation.targetVolumePerDripper) / 1000;

  // Real-time process calculations
  let currentTotalVolume = 0;
  let currentRemaining = 0;
  let activeValveName = "";
  let progressPercent = 0;

  const isRunning = irrigationProcess.status === 'WATERING_A' || irrigationProcess.status === 'WATERING_B';
  const isQueued = queuePosition >= 0;

  if (irrigationProcess.status === 'WATERING_A') {
      currentTotalVolume = configVolumeA; 
      currentRemaining = irrigationProcess.remainingVolumeA;
      activeValveName = "КРАН А (Зона 1)";
  } else if (irrigationProcess.status === 'WATERING_B') {
      currentTotalVolume = configVolumeB;
      currentRemaining = irrigationProcess.remainingVolumeB;
      activeValveName = "КРАН B (Зона 2)";
  }

  if (currentTotalVolume > 0) {
      progressPercent = (currentRemaining / currentTotalVolume) * 100;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header & Main Mode Switch */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Droplets className="text-cyan-400" />
            Управление Поливом
          </h2>
          <p className="text-slate-400 text-sm mt-1">Зона: {block.name}</p>
        </div>
        
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
           <button 
             onClick={() => handleChange('mode', 'AUTO')}
             className={`px-6 py-2 rounded-md font-bold transition-all ${irrigation.mode === 'AUTO' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             АВТО (Расписание)
           </button>
           <button 
             onClick={() => handleChange('mode', 'MANUAL')}
             className={`px-6 py-2 rounded-md font-bold transition-all ${irrigation.mode === 'MANUAL' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             РУЧНОЙ
           </button>
        </div>
      </div>

      {/* MONITORING PANEL */}
      <div className={`bg-slate-800 border rounded-xl p-6 shadow-lg ${isQueued ? 'border-amber-500/50' : (isRunning ? 'border-cyan-500/50' : 'border-slate-700')}`}>
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Controls */}
            <div className="flex flex-col gap-4 min-w-[200px]">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity size={20} className={isRunning ? "text-cyan-400" : (isQueued ? "text-amber-400" : "text-slate-400")}/> 
                    Статус: <span className={isRunning ? "text-cyan-400" : (isQueued ? "text-amber-400" : "text-slate-400")}>
                        {isRunning ? 'ПОЛИВ' : (isQueued ? 'В ОЧЕРЕДИ' : 'ОЖИДАНИЕ')}
                    </span>
                 </h3>
                 
                 {!isRunning && !isQueued && (
                    <button 
                      onClick={onStartManual}
                      disabled={irrigation.mode === 'AUTO'}
                      className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-xl font-bold shadow-lg transition-all ${
                          irrigation.mode === 'AUTO' 
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20 active:scale-95'
                      }`}
                    >
                      <Play fill="currentColor" /> {irrigation.mode === 'AUTO' ? 'Режим АВТО' : 'СТАРТ'}
                    </button>
                 )}

                 {(isRunning || isQueued) && (
                    <button 
                      onClick={onStopManual}
                      className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-xl text-xl font-bold shadow-lg shadow-red-900/20 active:scale-95 transition-all"
                    >
                      <Square fill="currentColor" /> ОТМЕНА
                    </button>
                 )}
            </div>

            {/* Status Display Area */}
            <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 p-5 flex flex-col justify-center">
               
               {/* STATE 1: IDLE */}
               {!isRunning && !isQueued && (
                   <div className="text-center text-slate-500 flex flex-col items-center">
                       <Timer size={40} className="mb-2 opacity-20"/>
                       <span className="text-lg font-medium">Система полива готова</span>
                       <span className="text-sm">Ожидание команды оператора или времени расписания</span>
                   </div>
               )}

               {/* STATE 2: QUEUED */}
               {isQueued && !isRunning && (
                   <div className="text-center flex flex-col items-center animate-pulse">
                       <Hourglass size={40} className="mb-2 text-amber-500"/>
                       <span className="text-xl font-bold text-amber-400">Ожидание в очереди</span>
                       <span className="text-sm text-slate-400">Позиция: {queuePosition + 1}. Полив начнется автоматически.</span>
                   </div>
               )}

               {/* STATE 3: RUNNING */}
               {isRunning && (
                   <div className="space-y-4">
                       <div className="flex justify-between items-end">
                           <div>
                               <div className="text-cyan-400 text-sm font-bold tracking-wider uppercase mb-1 flex items-center gap-2">
                                   <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"/> 
                                   Подача смеси: {activeValveName}
                               </div>
                               <div className="text-3xl font-bold text-white">
                                   {currentRemaining.toFixed(1)} <span className="text-lg text-slate-400 font-normal">литров осталось</span>
                               </div>
                           </div>
                           <div className="text-right">
                               <div className="text-slate-400 text-xs">Всего на цикл</div>
                               <div className="text-xl font-mono text-slate-300">{currentTotalVolume.toFixed(1)} л</div>
                           </div>
                       </div>

                       {/* The Liquid Bar */}
                       <div className="relative h-8 bg-slate-800 rounded-full overflow-hidden border border-slate-600 shadow-inner">
                           <div className="absolute inset-0 opacity-10" 
                                style={{backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem'}}>
                           </div>
                           
                           <div 
                               className={`h-full transition-all duration-300 ease-out relative ${irrigationProcess.status === 'WATERING_A' ? 'bg-cyan-500' : 'bg-emerald-500'}`}
                               style={{ width: `${progressPercent}%` }}
                           >
                               <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]"></div>
                           </div>

                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                               <span className="text-white font-bold drop-shadow-md text-sm">
                                   {progressPercent.toFixed(0)}%
                               </span>
                           </div>
                       </div>
                   </div>
               )}
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Configuration */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Zone Configuration */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings2 size={20} className="text-slate-400" />
              Конфигурация Зон (Краны)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Valve A */}
               <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600">
                 <div className="flex justify-between items-center mb-2">
                   <h4 className="font-bold text-cyan-300">Кран А (Зона 1)</h4>
                   <div className={`w-3 h-3 rounded-full ${devices.irrigationValveA ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
                 </div>
                 <div className="space-y-3">
                   <div>
                     <label className="text-xs text-slate-400 block mb-1">Площадь (м²)</label>
                     <input 
                       type="number" 
                       value={irrigation.valveAArea}
                       onChange={(e) => handleChange('valveAArea', parseFloat(e.target.value))}
                       className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-white text-sm"
                     />
                   </div>
                   <div className="text-sm text-slate-300 flex justify-between">
                     <span>Капельниц (расчет):</span>
                     <span className="font-mono">{drippersA.toFixed(0)}</span>
                   </div>
                   <div className="text-sm text-cyan-400 flex justify-between font-bold">
                     <span>Объем смеси:</span>
                     <span>{configVolumeA.toFixed(1)} л</span>
                   </div>
                 </div>
               </div>

               {/* Valve B */}
               <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600">
                 <div className="flex justify-between items-center mb-2">
                   <h4 className="font-bold text-cyan-300">Кран B (Зона 2)</h4>
                   <div className={`w-3 h-3 rounded-full ${devices.irrigationValveB ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
                 </div>
                 <div className="space-y-3">
                   <div>
                     <label className="text-xs text-slate-400 block mb-1">Площадь (м²)</label>
                     <input 
                       type="number" 
                       value={irrigation.valveBArea}
                       onChange={(e) => handleChange('valveBArea', parseFloat(e.target.value))}
                       className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-white text-sm"
                     />
                   </div>
                   <div className="text-sm text-slate-300 flex justify-between">
                     <span>Капельниц (расчет):</span>
                     <span className="font-mono">{drippersB.toFixed(0)}</span>
                   </div>
                   <div className="text-sm text-cyan-400 flex justify-between font-bold">
                     <span>Объем смеси:</span>
                     <span>{configVolumeB.toFixed(1)} л</span>
                   </div>
                 </div>
               </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-slate-400 text-sm mb-1">Всего капельниц в блоке (шт)</label>
                   <input 
                     type="number" 
                     value={irrigation.totalDrippers}
                     onChange={(e) => handleChange('totalDrippers', parseFloat(e.target.value))}
                     className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                   />
                </div>
                <div>
                   <label className="block text-cyan-400 font-bold text-sm mb-1">Целевой объем на 1 капельницу (мл)</label>
                   <input 
                     type="number" 
                     value={irrigation.targetVolumePerDripper}
                     onChange={(e) => handleChange('targetVolumePerDripper', parseFloat(e.target.value))}
                     className="w-full bg-slate-900 border border-cyan-500/50 rounded-lg px-4 py-2 text-white font-bold focus:ring-2 focus:ring-cyan-500 outline-none"
                   />
                   <p className="text-xs text-slate-500 mt-1">Система автоматически рассчитает время работы кранов.</p>
                </div>
            </div>
          </div>

          {/* Chemical Config */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
             <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
               <Beaker size={20} className="text-purple-400" />
               Параметры раствора (EC / pH)
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                 <div className="flex justify-between">
                   <label className="text-slate-300">Целевой EC (mS/cm)</label>
                   <span className="text-cyan-400 font-bold">{irrigation.targetEC.toFixed(1)}</span>
                 </div>
                 <input 
                   type="range" min="0" max="5" step="0.1"
                   value={irrigation.targetEC}
                   onChange={(e) => handleChange('targetEC', parseFloat(e.target.value))}
                   className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                 />
               </div>
               <div className="space-y-2">
                 <div className="flex justify-between">
                   <label className="text-slate-300">Целевой pH</label>
                   <span className="text-purple-400 font-bold">{irrigation.targetPH.toFixed(1)}</span>
                 </div>
                 <input 
                   type="range" min="4" max="9" step="0.1"
                   value={irrigation.targetPH}
                   onChange={(e) => handleChange('targetPH', parseFloat(e.target.value))}
                   className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                 />
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: Schedule & Injectors */}
        <div className="space-y-6">
           
           {/* Schedule */}
           <div className={`bg-slate-800 border border-slate-700 rounded-xl p-6 ${irrigation.mode === 'MANUAL' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
             <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
               <Clock size={20} className="text-green-400" />
               Расписание поливов (24ч)
             </h3>
             
             <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto pr-2">
               {irrigation.schedule.length === 0 && <p className="text-slate-500 text-sm italic">Нет запланированных поливов</p>}
               {irrigation.schedule.map(item => (
                 <div key={item.id} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                    <span className="text-xl font-mono text-white font-bold">{item.startTime}</span>
                    <button onClick={() => handleRemoveSchedule(item.id)} className="text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 size={18} />
                    </button>
                 </div>
               ))}
             </div>

             <div className="flex gap-2">
               <input 
                 type="time" 
                 value={newTime}
                 onChange={(e) => setNewTime(e.target.value)}
                 className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white outline-none flex-1"
               />
               <button 
                 onClick={handleAddSchedule}
                 className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
               >
                 <Plus size={20} />
               </button>
             </div>
           </div>

           {/* Injectors Monitoring */}
           <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap size={20} className="text-yellow-400" />
                Инжекторы и Датчики
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center">
                  <div className="text-xs text-slate-500">Факт EC</div>
                  <div className={`text-2xl font-bold ${Math.abs(sensors.currentEC - irrigation.targetEC) > 0.3 ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {sensors.currentEC.toFixed(2)}
                  </div>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center">
                  <div className="text-xs text-slate-500">Факт pH</div>
                  <div className={`text-2xl font-bold ${Math.abs(sensors.currentPH - irrigation.targetPH) > 0.3 ? 'text-amber-400' : 'text-purple-400'}`}>
                    {sensors.currentPH.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                 <InjectorStatus label="Удобрение A" active={devices.injectorNutrientA} color="bg-cyan-500" />
                 <InjectorStatus label="Удобрение B" active={devices.injectorNutrientB} color="bg-cyan-600" />
                 <InjectorStatus label="Кислота (pH-)" active={devices.injectorAcid} color="bg-red-500" />
                 <InjectorStatus label="Щелочь (pH+)" active={devices.injectorBase} color="bg-green-500" />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

const InjectorStatus: React.FC<{label: string, active: boolean, color: string}> = ({label, active, color}) => (
  <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-700">
    <span className="text-slate-300 text-sm">{label}</span>
    <div className={`w-3 h-3 rounded-full ${active ? `${color} animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]` : 'bg-slate-800'}`}></div>
  </div>
);
