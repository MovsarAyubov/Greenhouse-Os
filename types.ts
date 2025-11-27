
export interface HistoricalDataPoint {
  time: string;
  temp: number;
  humidity: number;
}

export interface ExternalWeather {
  temperature: number;
  windSpeed: number; // м/с
  windDirection: string; // N, NE, E, etc.
  solarRadiation: number; // Вт/м²
}

export interface IrrigationScheduleItem {
  id: string;
  startTime: string; // "08:00"
  enabled: boolean;
}

export interface IrrigationConfig {
  mode: 'MANUAL' | 'AUTO';
  
  // Геометрия
  totalDrippers: number; // Общее кол-во капельниц
  valveAArea: number; // Площадь под краном А
  valveBArea: number; // Площадь под краном B
  
  // Дозировка
  targetVolumePerDripper: number; // мл на капельницу
  
  // Химия
  targetEC: number; // Electrical Conductivity
  targetPH: number; // Acidity
  
  // Автоматика
  schedule: IrrigationScheduleItem[];
}

export interface IrrigationProcess {
  status: 'IDLE' | 'WAITING' | 'WATERING_A' | 'WATERING_B'; // Added WAITING
  remainingVolumeA: number; // Сколько литров осталось вылить через кран А
  remainingVolumeB: number; // Сколько литров осталось вылить через кран B
  currentFlowRate: number; // л/мин (для симуляции)
}

export interface BlockConfig {
  targetTempDay: number;
  targetTempNight: number;
  ventOpenThreshold: number;
  heaterStartThreshold: number;
  curtainCloseLightLevel: number;
  autoMode: boolean; // Это для климата
  irrigation: IrrigationConfig;
}

export interface BlockDevices {
  heater: boolean;
  vents: boolean;
  curtains: boolean;
  
  // Полив
  irrigationPump: boolean; // Главный насос
  irrigationValveA: boolean; // Кран зоны 1
  irrigationValveB: boolean; // Кран зоны 2

  // Инжекторы для полива
  injectorAcid: boolean; // pH Down
  injectorBase: boolean; // pH Up
  injectorNutrientA: boolean; // EC Up
  injectorNutrientB: boolean; // EC Up
}

export interface BlockSensors {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  co2Level: number;
  lightLevel: number;
  // Датчики поливочной смеси
  currentEC: number;
  currentPH: number;
  timestamp: number;
}

export interface GreenhouseBlock {
  id: string;
  name: string;
  sensors: BlockSensors;
  devices: BlockDevices;
  config: BlockConfig;
  irrigationProcess: IrrigationProcess; // Текущее состояние процесса полива
  history: HistoricalDataPoint[];
}

export enum View {
  OVERVIEW = 'OVERVIEW',
  EXTERNAL = 'EXTERNAL',
  INTERNAL = 'INTERNAL',
  IRRIGATION = 'IRRIGATION',
  CONTROLS = 'CONTROLS',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS'
}
