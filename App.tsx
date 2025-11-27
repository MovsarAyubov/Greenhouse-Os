
import React, { useState, useEffect, useRef } from 'react';
import { View, GreenhouseBlock, ExternalWeather, IrrigationProcess } from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ControlPanel } from './components/ControlPanel';
import { ExternalClimate } from './components/ExternalClimate';
import { IrrigationPanel } from './components/IrrigationPanel';
import { OverviewDashboard } from './components/OverviewDashboard';
import { SystemSettings } from './components/SystemSettings';
import { getAgronomistAdvice } from './services/geminiService';
import { Sparkles, RefreshCw, Warehouse } from 'lucide-react';

const INITIAL_WEATHER: ExternalWeather = {
  temperature: 15,
  windSpeed: 3.5,
  windDirection: 'NE',
  solarRadiation: 450
};

const DEFAULT_IRRIGATION_PROCESS: IrrigationProcess = {
  status: 'IDLE',
  remainingVolumeA: 0,
  remainingVolumeB: 0,
  currentFlowRate: 0
};

// Factory to create a new block with default settings
const createNewBlock = (name: string): GreenhouseBlock => {
    return {
        id: `block-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        name: name,
        sensors: { 
            temperature: 20 + Math.random() * 5, 
            humidity: 60, 
            soilMoisture: 50, 
            co2Level: 400, 
            lightLevel: 500, 
            currentEC: 2.0, 
            currentPH: 6.0, 
            timestamp: Date.now() 
        },
        devices: { 
            heater: false, vents: false, curtains: false, 
            irrigationPump: false, irrigationValveA: false, irrigationValveB: false, 
            injectorAcid: false, injectorBase: false, injectorNutrientA: false, injectorNutrientB: false 
        },
        config: { 
            targetTempDay: 24, targetTempNight: 18, 
            ventOpenThreshold: 26, heaterStartThreshold: 20, 
            curtainCloseLightLevel: 10000, autoMode: true,
            irrigation: { 
                mode: 'AUTO',
                totalDrippers: 1000,
                valveAArea: 100,
                valveBArea: 100,
                targetVolumePerDripper: 100,
                targetEC: 2.5, 
                targetPH: 6.0,
                schedule: []
            }
        },
        irrigationProcess: { ...DEFAULT_IRRIGATION_PROCESS },
        history: []
    };
};

const INITIAL_BLOCKS: GreenhouseBlock[] = [
  {
    id: 'block-1',
    name: 'Блок А (Рассада)',
    sensors: { temperature: 24.5, humidity: 65, soilMoisture: 70, co2Level: 500, lightLevel: 800, currentEC: 2.1, currentPH: 6.0, timestamp: Date.now() },
    devices: { heater: false, vents: false, curtains: false, irrigationPump: false, irrigationValveA: false, irrigationValveB: false, injectorAcid: false, injectorBase: false, injectorNutrientA: false, injectorNutrientB: false },
    config: { 
      targetTempDay: 25, targetTempNight: 20, ventOpenThreshold: 27, heaterStartThreshold: 22, curtainCloseLightLevel: 10000, autoMode: true,
      irrigation: { 
        mode: 'AUTO',
        totalDrippers: 2000,
        valveAArea: 250,
        valveBArea: 250,
        targetVolumePerDripper: 100,
        targetEC: 2.5, 
        targetPH: 5.8,
        schedule: [{ id: '1', startTime: '08:00', enabled: true }, { id: '2', startTime: '16:00', enabled: true }]
      }
    },
    irrigationProcess: { ...DEFAULT_IRRIGATION_PROCESS },
    history: []
  },
  {
    id: 'block-2',
    name: 'Блок Б (Томаты)',
    sensors: { temperature: 21.0, humidity: 55, soilMoisture: 50, co2Level: 450, lightLevel: 900, currentEC: 2.8, currentPH: 6.5, timestamp: Date.now() },
    devices: { heater: false, vents: false, curtains: false, irrigationPump: false, irrigationValveA: false, irrigationValveB: false, injectorAcid: false, injectorBase: false, injectorNutrientA: false, injectorNutrientB: false },
    config: { 
      targetTempDay: 22, targetTempNight: 17, ventOpenThreshold: 25, heaterStartThreshold: 18, curtainCloseLightLevel: 12000, autoMode: true,
      irrigation: { 
        mode: 'AUTO',
        totalDrippers: 4000,
        valveAArea: 600,
        valveBArea: 400,
        targetVolumePerDripper: 120,
        targetEC: 3.0, 
        targetPH: 6.2,
        schedule: [{ id: '1', startTime: '07:30', enabled: true }]
      }
    },
    irrigationProcess: { ...DEFAULT_IRRIGATION_PROCESS },
    history: []
  },
  {
    id: 'block-3',
    name: 'Блок В (Огурцы)',
    sensors: { temperature: 26.0, humidity: 80, soilMoisture: 75, co2Level: 600, lightLevel: 750, currentEC: 1.8, currentPH: 6.8, timestamp: Date.now() },
    devices: { heater: false, vents: false, curtains: false, irrigationPump: false, irrigationValveA: false, irrigationValveB: false, injectorAcid: false, injectorBase: false, injectorNutrientA: false, injectorNutrientB: false },
    config: { 
      targetTempDay: 26, targetTempNight: 21, ventOpenThreshold: 28, heaterStartThreshold: 24, curtainCloseLightLevel: 9000, autoMode: true,
      irrigation: { 
        mode: 'MANUAL',
        totalDrippers: 3200,
        valveAArea: 400,
        valveBArea: 400,
        targetVolumePerDripper: 150,
        targetEC: 2.2, 
        targetPH: 6.0,
        schedule: []
      }
    },
    irrigationProcess: { ...DEFAULT_IRRIGATION_PROCESS },
    history: []
  }
];

// Helper to calculate total volume for a valve based on area ratio
const calculateVolumeForValve = (config: any, isValveA: boolean) => {
  const totalArea = config.valveAArea + config.valveBArea;
  if (totalArea === 0) return 0;
  
  const area = isValveA ? config.valveAArea : config.valveBArea;
  const ratio = area / totalArea;
  const drippersForValve = config.totalDrippers * ratio;
  
  // result in Liters (ml / 1000)
  return (drippersForValve * config.targetVolumePerDripper) / 1000;
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.OVERVIEW);
  const [blocks, setBlocks] = useState<GreenhouseBlock[]>(INITIAL_BLOCKS);
  const [activeBlockId, setActiveBlockId] = useState<string>(INITIAL_BLOCKS[0].id);
  const [weather, setWeather] = useState<ExternalWeather>(INITIAL_WEATHER);
  
  // GLOBAL IRRIGATION QUEUE
  // Stores IDs of blocks waiting to be watered.
  const [irrigationQueue, setIrrigationQueue] = useState<string[]>([]);
  
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentSeconds = now.getSeconds(); 

      // Update External Weather
      setWeather(prev => ({
        temperature: prev.temperature + (Math.random() - 0.5) * 0.1,
        windSpeed: Math.max(0, prev.windSpeed + (Math.random() - 0.5) * 0.5),
        windDirection: prev.windDirection,
        solarRadiation: Math.max(0, prev.solarRadiation + (Math.random() - 0.5) * 10),
      }));

      // --- DISPATCHER LOGIC ---
      // We need to check if we can start the next block in queue.
      // Condition: No other block is currently WATERING_A or WATERING_B.
      
      let nextBlockIdToStart: string | null = null;
      
      setBlocks(currentBlocks => {
          // 1. Check Global Status
          const busyBlock = currentBlocks.find(b => 
              b.irrigationProcess.status === 'WATERING_A' || 
              b.irrigationProcess.status === 'WATERING_B'
          );

          // 2. Schedule Check (Enqueue)
          // Use a flag to avoid enqueueing multiple times per minute, relying on seconds === 0
          let newQueueItems: string[] = [];
          
          if (currentSeconds === 0) {
              currentBlocks.forEach(b => {
                 if (b.config.irrigation.mode === 'AUTO' && b.irrigationProcess.status === 'IDLE') {
                     const isScheduled = b.config.irrigation.schedule.some(s => s.enabled && s.startTime === currentTimeString);
                     if (isScheduled) {
                         // Add to queue if not already there and not running
                         newQueueItems.push(b.id);
                     }
                 }
              });
          }

          // 3. Process Blocks
          const updatedBlocks = currentBlocks.map(block => {
            let newDevices = { ...block.devices };
            let irrigationProc = { ...block.irrigationProcess };
            const irrConfig = block.config.irrigation;

            // --- IRRIGATION STATE MACHINE ---
            // IDLE -> (Wait for Dispatcher) -> WATERING_A -> WATERING_B -> IDLE

            if (irrigationProc.status === 'WATERING_A') {
              newDevices.irrigationPump = true;
              newDevices.irrigationValveA = true;
              newDevices.irrigationValveB = false;
              
              irrigationProc.remainingVolumeA -= 2; // Simulation speed

              if (irrigationProc.remainingVolumeA <= 0) {
                irrigationProc.remainingVolumeA = 0;
                irrigationProc.status = 'WATERING_B'; // Transition
              }
            } else if (irrigationProc.status === 'WATERING_B') {
              newDevices.irrigationPump = true;
              newDevices.irrigationValveA = false;
              newDevices.irrigationValveB = true;

              irrigationProc.remainingVolumeB -= 2;

              if (irrigationProc.remainingVolumeB <= 0) {
                irrigationProc.remainingVolumeB = 0;
                irrigationProc.status = 'IDLE'; // Finish
                // The Dispatcher in the NEXT tick will see it's free and pick the next one
              }
            } else {
              // IDLE or WAITING
              newDevices.irrigationPump = false;
              newDevices.irrigationValveA = false;
              newDevices.irrigationValveB = false;
              irrigationProc.currentFlowRate = 0;
            }

            // --- CLIMATE PHYSICS & INJECTORS (Same as before) ---
            const tempChange = (Math.random() - 0.5) * 0.3;
            let newTemp = block.sensors.temperature + tempChange;
            let newHum = block.sensors.humidity + (Math.random() - 0.5) * 0.6;

            if (block.devices.heater) newTemp += 0.15;
            if (block.devices.vents) newTemp -= 0.2;
            if (block.devices.irrigationValveA || block.devices.irrigationValveB) newHum += 0.3;

            let currentEC = block.sensors.currentEC;
            let currentPH = block.sensors.currentPH;
            
            if (newDevices.irrigationPump) {
                const targetEC = irrConfig.targetEC;
                const targetPH = irrConfig.targetPH;
                if (currentEC < targetEC - 0.1) {
                  newDevices.injectorNutrientA = true; newDevices.injectorNutrientB = true; currentEC += 0.05; 
                } else {
                  newDevices.injectorNutrientA = false; newDevices.injectorNutrientB = false;
                  if (currentEC > targetEC + 0.1) currentEC -= 0.01; 
                }
                if (currentPH > targetPH + 0.1) {
                  newDevices.injectorAcid = true; newDevices.injectorBase = false; currentPH -= 0.05; 
                } else if (currentPH < targetPH - 0.1) {
                  newDevices.injectorAcid = false; newDevices.injectorBase = true; currentPH += 0.05; 
                } else {
                  newDevices.injectorAcid = false; newDevices.injectorBase = false;
                }
            } else {
                newDevices.injectorAcid = false; newDevices.injectorBase = false;
                newDevices.injectorNutrientA = false; newDevices.injectorNutrientB = false;
            }

            if (block.config.autoMode) {
              if (newTemp < block.config.heaterStartThreshold) newDevices.heater = true;
              else if (newTemp > block.config.heaterStartThreshold + 1.5) newDevices.heater = false;

              if (newTemp > block.config.ventOpenThreshold) newDevices.vents = true;
              else if (newTemp < block.config.ventOpenThreshold - 1) newDevices.vents = false;
            }

            return {
              ...block,
              sensors: { ...block.sensors, temperature: parseFloat(newTemp.toFixed(2)), humidity: parseFloat(newHum.toFixed(2)), currentEC: parseFloat(currentEC.toFixed(2)), currentPH: parseFloat(currentPH.toFixed(2)), timestamp: Date.now() },
              devices: newDevices,
              irrigationProcess: irrigationProc
            };
          });
          
          // Side Effect: Update Queue if Scheduler triggered
          if (newQueueItems.length > 0) {
               setIrrigationQueue(prev => {
                   const unique = new Set([...prev, ...newQueueItems]);
                   return Array.from(unique);
               });
          }

          return updatedBlocks;
      });

    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Separate Effect for Dispatcher to manage Queue
  // This runs whenever blocks or queue changes to check if we can start the next job
  useEffect(() => {
     const isSystemBusy = blocks.some(b => b.irrigationProcess.status === 'WATERING_A' || b.irrigationProcess.status === 'WATERING_B');
     
     if (!isSystemBusy && irrigationQueue.length > 0) {
         const nextId = irrigationQueue[0];
         
         // Start this block
         setBlocks(prev => prev.map(b => {
             if (b.id === nextId) {
                 const volA = calculateVolumeForValve(b.config.irrigation, true);
                 const volB = calculateVolumeForValve(b.config.irrigation, false);
                 return {
                     ...b,
                     irrigationProcess: {
                         ...b.irrigationProcess,
                         status: 'WATERING_A',
                         remainingVolumeA: volA,
                         remainingVolumeB: volB,
                         currentFlowRate: 50
                     }
                 };
             }
             return b;
         }));

         // Remove from queue
         setIrrigationQueue(prev => prev.slice(1));
     }
  }, [blocks, irrigationQueue]);

  // History Tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setBlocks(prevBlocks => prevBlocks.map(block => {
        const now = new Date();
        const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        const newPoint = { time: timeString, temp: block.sensors.temperature, humidity: block.sensors.humidity };
        const newHistory = [...block.history, newPoint];
        if (newHistory.length > 20) newHistory.shift();
        
        return {
          ...block,
          history: newHistory
        };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateBlockConfig = (blockId: string, newConfig: any) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, config: newConfig } : b));
  };

  const handleUpdateIrrigation = (blockId: string, newIrrigation: any) => {
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, config: { ...b.config, irrigation: newIrrigation } } : b));
  };
  
  const handleAddToQueue = (blockIds: string[]) => {
      setIrrigationQueue(prev => {
          // Add only if not already in queue and not already running (simplified check)
          const newItems = blockIds.filter(id => !prev.includes(id));
          return [...prev, ...newItems];
      });
  };

  const handleStartAllIrrigation = () => {
      const allIds = blocks.map(b => b.id);
      handleAddToQueue(allIds);
  };
  
  const handleStopIrrigation = (blockId: string) => {
     // If in queue, remove from queue
     setIrrigationQueue(prev => prev.filter(id => id !== blockId));

     // If running, stop it
     setBlocks(prev => prev.map(b => {
        if (b.id !== blockId) return b;
        return {
            ...b,
            irrigationProcess: { ...DEFAULT_IRRIGATION_PROCESS }
        };
     }));
  };

  const handleAddBlock = (name: string) => {
      const newBlock = createNewBlock(name);
      setBlocks(prev => [...prev, newBlock]);
  };

  const handleRemoveBlock = (id: string) => {
      setBlocks(prev => {
          const newBlocks = prev.filter(b => b.id !== id);
          if (id === activeBlockId && newBlocks.length > 0) {
              setActiveBlockId(newBlocks[0].id);
          }
          return newBlocks;
      });
  };

  const handleRenameBlock = (id: string, newName: string) => {
      setBlocks(prev => prev.map(b => b.id === id ? { ...b, name: newName } : b));
  };

  const activeBlock = blocks.find(b => b.id === activeBlockId) || blocks[0] || createNewBlock("Default");

  const handleAskAI = async () => {
    setLoadingAi(true);
    setAiAdvice("Анализирую данные блока...");
    const advice = await getAgronomistAdvice(activeBlock);
    setAiAdvice(advice);
    setLoadingAi(false);
  };
  
  const handleSelectBlockFromOverview = (blockId: string) => {
      setActiveBlockId(blockId);
      setCurrentView(View.INTERNAL);
  };

  const renderViewContent = () => {
    if (blocks.length === 0 && currentView !== View.SETTINGS) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Warehouse size={64} className="mb-4 opacity-50"/>
                <h3 className="text-xl font-bold mb-2">Нет настроенных блоков</h3>
                <p className="mb-6">Пожалуйста, добавьте блоки теплицы в настройках.</p>
                <button 
                    onClick={() => setCurrentView(View.SETTINGS)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                >
                    Перейти к настройкам
                </button>
            </div>
        );
    }

    switch (currentView) {
      case View.OVERVIEW:
        return (
            <OverviewDashboard 
                blocks={blocks} 
                queue={irrigationQueue}
                onSelectBlock={handleSelectBlockFromOverview} 
                onAddToQueue={handleAddToQueue}
                onStartAll={handleStartAllIrrigation}
                onRemoveFromQueue={(id) => setIrrigationQueue(q => q.filter(x => x !== id))}
            />
        );
      case View.EXTERNAL:
        return <ExternalClimate weather={weather} />;
      case View.INTERNAL:
        return <Dashboard block={activeBlock} />;
      case View.IRRIGATION:
        return (
            <IrrigationPanel 
                block={activeBlock} 
                queuePosition={irrigationQueue.indexOf(activeBlock.id)}
                onConfigChange={(newConf) => handleUpdateIrrigation(activeBlock.id, newConf)} 
                onStartManual={() => handleAddToQueue([activeBlock.id])}
                onStopManual={() => handleStopIrrigation(activeBlock.id)}
            />
        );
      case View.CONTROLS:
        return <ControlPanel config={activeBlock.config} onConfigChange={(newConf) => handleUpdateBlockConfig(activeBlock.id, newConf)} blockName={activeBlock.name} />;
      case View.SETTINGS:
        return (
            <SystemSettings 
                blocks={blocks} 
                onAddBlock={handleAddBlock} 
                onRemoveBlock={handleRemoveBlock}
                onRenameBlock={handleRenameBlock}
            />
        );
      case View.ANALYTICS:
        return (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
             <div className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Sparkles size={120} className="text-indigo-400" />
               </div>
               
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="p-3 bg-indigo-500 rounded-lg">
                     <Sparkles className="text-white" size={24} />
                   </div>
                   <h3 className="text-2xl font-bold text-white">Агроном для: {activeBlock.name}</h3>
                 </div>
                 
                 <p className="text-indigo-200 mb-6 text-lg">
                   ИИ проанализирует датчики именно этого блока и настройки его автоматики.
                 </p>

                 <div className="bg-slate-900/50 rounded-xl p-6 min-h-[120px] mb-6 border border-indigo-500/20">
                   {loadingAi ? (
                     <div className="flex items-center gap-3 text-indigo-300 animate-pulse">
                       <RefreshCw className="animate-spin" />
                       Генерация совета...
                     </div>
                   ) : (
                     <p className="text-lg leading-relaxed text-slate-100">
                       {aiAdvice || "Нажмите кнопку, чтобы получить анализ состояния блока."}
                     </p>
                   )}
                 </div>

                 <button 
                  onClick={handleAskAI}
                  disabled={loadingAi}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {loadingAi ? 'Думаю...' : 'Получить рекомендацию'}
                 </button>
               </div>
             </div>
          </div>
        );
      default:
        return <Dashboard block={activeBlock} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-200">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      
      <main className="ml-64 flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
             <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Warehouse className="text-blue-500"/>
              {currentView === View.OVERVIEW ? 'Центр Управления' : (activeBlock ? activeBlock.name : 'Система')}
             </h2>
             <p className="text-slate-400 text-sm mt-1">
               {currentView === View.OVERVIEW && 'Общий мониторинг и управление очередью полива'}
               {currentView === View.INTERNAL && 'Внутренний микроклимат и состояние оборудования'}
               {currentView === View.EXTERNAL && 'Погодные условия снаружи теплицы'}
               {currentView === View.IRRIGATION && 'Настройка фертигации, EC и pH'}
               {currentView === View.CONTROLS && 'Конфигурация автоматики блока'}
               {currentView === View.SETTINGS && 'Масштабирование и управление зонами'}
               {currentView === View.ANALYTICS && 'ИИ Ассистент'}
             </p>
          </div>
          
          {currentView !== View.OVERVIEW && currentView !== View.SETTINGS && blocks.length > 0 && (
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                {blocks.map(block => (
                <button
                    key={block.id}
                    onClick={() => setActiveBlockId(block.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeBlockId === block.id 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                >
                    {block.name}
                </button>
                ))}
            </div>
          )}
        </div>

        {renderViewContent()}
      </main>
    </div>
  );
};

export default App;
