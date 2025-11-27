
import React, { useState } from 'react';
import { GreenhouseBlock } from '../types';
import { Thermometer, Droplets, Wind, Zap, ArrowRight, Fan, Blinds, Layers, Play, CheckSquare, ListOrdered, X } from 'lucide-react';

interface OverviewDashboardProps {
  blocks: GreenhouseBlock[];
  queue: string[];
  onSelectBlock: (blockId: string) => void;
  onAddToQueue: (blockIds: string[]) => void;
  onStartAll: () => void;
  onRemoveFromQueue: (id: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ blocks, queue, onSelectBlock, onAddToQueue, onStartAll, onRemoveFromQueue }) => {
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedBlocks);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedBlocks(newSet);
  };

  const handleQueueSelected = () => {
    if (selectedBlocks.size > 0) {
      onAddToQueue(Array.from(selectedBlocks));
      setSelectedBlocks(new Set());
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Global Irrigation Control Panel */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
         <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-cyan-600 rounded-lg">
                <Layers className="text-white" size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Центр Управления Поливом</h2>
                <p className="text-slate-400 text-sm">Управление очередью полива всего комплекса</p>
            </div>
         </div>

         <div className="flex flex-col lg:flex-row gap-8">
            {/* Actions */}
            <div className="flex-1 space-y-4">
               <div className="flex gap-4">
                  <button 
                    onClick={onStartAll}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-900/20"
                  >
                    <Play fill="currentColor" size={18} />
                    Полить ВСЕ блоки
                  </button>
                  <button 
                    onClick={handleQueueSelected}
                    disabled={selectedBlocks.size === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <ListOrdered size={18} />
                    Добавить выбранные ({selectedBlocks.size})
                  </button>
               </div>
               <p className="text-xs text-slate-500">
                 * Система автоматически польет блоки один за другим, соблюдая очередность кранов (А затем Б).
               </p>
            </div>

            {/* Queue Visualization */}
            <div className="flex-1 bg-slate-900 rounded-lg p-4 border border-slate-700">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                 <ListOrdered size={16} /> Текущая очередь
               </h3>
               {queue.length === 0 ? (
                 <div className="text-slate-600 text-center py-4 italic text-sm">Очередь пуста. Система в ожидании.</div>
               ) : (
                 <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                   {queue.map((id, index) => {
                     const blockName = blocks.find(b => b.id === id)?.name || id;
                     return (
                       <div key={`${id}-${index}`} className="flex justify-between items-center bg-slate-800 px-3 py-2 rounded text-sm border border-slate-700">
                         <div className="flex items-center gap-2">
                           <span className="bg-slate-700 text-slate-400 w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono">{index + 1}</span>
                           <span className="text-slate-200">{blockName}</span>
                         </div>
                         <button onClick={() => onRemoveFromQueue(id)} className="text-slate-500 hover:text-red-400">
                           <X size={14} />
                         </button>
                       </div>
                     )
                   })}
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* Grid of Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {blocks.map((block) => (
          <div key={block.id} className="relative group">
             {/* Selection Checkbox Overlay */}
             <div className="absolute top-4 right-4 z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleSelection(block.id); }}
                  className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
                    selectedBlocks.has(block.id) 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-slate-900/80 border-slate-500 text-transparent hover:border-blue-400'
                  }`}
                >
                   <CheckSquare size={16} fill={selectedBlocks.has(block.id) ? "currentColor" : "none"} />
                </button>
             </div>

             <BlockSummaryCard 
               block={block} 
               onClick={() => onSelectBlock(block.id)} 
               queuePosition={queue.indexOf(block.id)}
             />
          </div>
        ))}
      </div>
    </div>
  );
};

const BlockSummaryCard: React.FC<{ block: GreenhouseBlock; onClick: () => void; queuePosition: number }> = ({ block, onClick, queuePosition }) => {
  const { sensors, devices, irrigationProcess, config } = block;
  
  const isIrrigating = irrigationProcess.status === 'WATERING_A' || irrigationProcess.status === 'WATERING_B';
  const activeValve = irrigationProcess.status === 'WATERING_A' ? 'Кран А' : (irrigationProcess.status === 'WATERING_B' ? 'Кран B' : '');
  
  return (
    <div 
      onClick={onClick}
      className={`bg-slate-800 border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer h-full
        ${selectedBlocks => /* Just a placeholder comment, logic handled in parent */ ""}
        ${isIrrigating ? 'border-cyan-500/50 shadow-cyan-900/20' : 'border-slate-700 hover:border-blue-500/50 hover:shadow-blue-900/10'}
      `}
    >
      {/* Header */}
      <div className="p-4 bg-slate-700/30 border-b border-slate-700 flex justify-between items-center">
        <h3 className="font-bold text-white flex items-center gap-2">
           <span className={`w-2 h-2 rounded-full ${config.autoMode ? 'bg-green-500' : 'bg-amber-500'}`}></span>
           {block.name}
        </h3>
        {/* Placeholder for arrow, pushed by flex justify */}
      </div>

      <div className="p-5 space-y-5">
        
        {/* Climate Row */}
        <div className="grid grid-cols-2 gap-4">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700/50 rounded-lg text-emerald-400">
                <Thermometer size={20} />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{sensors.temperature.toFixed(1)}°</div>
                <div className="text-xs text-slate-500">Цель: {config.targetTempDay}°</div>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700/50 rounded-lg text-blue-400">
                <Droplets size={20} />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{sensors.humidity.toFixed(0)}%</div>
                <div className="text-xs text-slate-500">Влажность</div>
              </div>
           </div>
        </div>

        {/* Devices Row */}
        <div className="flex gap-2">
            <DeviceBadge icon={Fan} active={devices.vents} label="Форт." activeColor="text-blue-400 bg-blue-400/10 border-blue-400/20" />
            <DeviceBadge icon={Wind} active={devices.heater} label="Отопл." activeColor="text-red-400 bg-red-400/10 border-red-400/20" />
            <DeviceBadge icon={Blinds} active={devices.curtains} label="Шторы" activeColor="text-purple-400 bg-purple-400/10 border-purple-400/20" />
        </div>

        {/* Irrigation Status */}
        <div className={`rounded-lg p-3 border ${isIrrigating ? 'bg-cyan-900/10 border-cyan-500/30' : (queuePosition >= 0 ? 'bg-amber-900/10 border-amber-500/30' : 'bg-slate-900/50 border-slate-700')}`}>
           <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Zap size={12} />
                Полив
              </span>
              {isIrrigating ? (
                <span className="text-xs font-bold text-cyan-400 animate-pulse">{activeValve}</span>
              ) : queuePosition >= 0 ? (
                 <span className="text-xs font-bold text-amber-400">В очереди: {queuePosition + 1}</span>
              ) : (
                <span className="text-xs text-slate-500">Ожидание</span>
              )}
           </div>

           {isIrrigating ? (
             <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2 overflow-hidden">
                <div className="bg-cyan-400 h-1.5 rounded-full animate-[shimmer_1s_infinite] w-full origin-left"></div>
             </div>
           ) : (
             <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2"></div>
           )}

           <div className="flex justify-between text-xs text-slate-400">
              <span>EC: <span className={isIrrigating ? "text-white" : ""}>{sensors.currentEC.toFixed(1)}</span></span>
              <span>pH: <span className={isIrrigating ? "text-white" : ""}>{sensors.currentPH.toFixed(1)}</span></span>
           </div>
        </div>

      </div>
    </div>
  );
};

const DeviceBadge: React.FC<{icon: any, active: boolean, label: string, activeColor: string}> = ({ icon: Icon, active, label, activeColor }) => (
  <div className={`flex-1 flex flex-col items-center justify-center p-2 rounded border transition-colors ${active ? activeColor : 'border-slate-700 bg-slate-800 text-slate-600'}`}>
     <Icon size={16} className="mb-1" />
     <span className="text-[10px] font-medium">{label}</span>
  </div>
);
