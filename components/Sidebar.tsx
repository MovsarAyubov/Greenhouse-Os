
import React from 'react';
import { View } from '../types';
import { LayoutDashboard, Sliders, Sprout, CloudSun, Droplets, ThermometerSun, LayoutGrid, Settings } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: View.OVERVIEW, label: 'Обзор Системы', icon: LayoutGrid },
    { id: View.EXTERNAL, label: 'Внешний климат', icon: CloudSun },
    { id: View.INTERNAL, label: 'Внутренний климат', icon: ThermometerSun },
    { id: View.IRRIGATION, label: 'Система полива', icon: Droplets },
    { id: View.CONTROLS, label: 'Настройки Блока', icon: Sliders },
    { id: View.ANALYTICS, label: 'ИИ Агроном', icon: Sprout },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-10">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-green-600 p-2 rounded-lg">
          <LayoutDashboard size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">Greenhouse OS</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4">
        <button
          onClick={() => onChangeView(View.SETTINGS)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            currentView === View.SETTINGS
              ? 'bg-slate-800 text-white border border-slate-600'
              : 'text-slate-500 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Settings size={20} />
          <span className="font-medium">Конфигурация</span>
        </button>

        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-xs text-slate-500 mb-1">Статус системы</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-semibold text-green-400">Активна</span>
          </div>
        </div>
      </div>
    </div>
  );
};