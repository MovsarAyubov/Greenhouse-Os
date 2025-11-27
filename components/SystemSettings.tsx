
import React, { useState } from 'react';
import { GreenhouseBlock } from '../types';
import { Plus, Trash2, Edit2, Check, X, Warehouse } from 'lucide-react';

interface SystemSettingsProps {
  blocks: GreenhouseBlock[];
  onAddBlock: (name: string) => void;
  onRemoveBlock: (id: string) => void;
  onRenameBlock: (id: string, newName: string) => void;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({ blocks, onAddBlock, onRemoveBlock, onRenameBlock }) => {
  const [newBlockName, setNewBlockName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (newBlockName.trim()) {
      onAddBlock(newBlockName.trim());
      setNewBlockName('');
    }
  };

  const startEditing = (block: GreenhouseBlock) => {
    setEditingId(block.id);
    setEditName(block.name);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      onRenameBlock(editingId, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
                <Warehouse className="text-white" size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white">Конфигурация Комплекса</h2>
                <p className="text-slate-400">Управление зонами и блоками теплицы</p>
            </div>
        </div>

        {/* Add New Block Section */}
        <div className="bg-slate-700/30 rounded-xl p-6 mb-8 border border-slate-600">
          <h3 className="text-lg font-semibold text-white mb-4">Добавить новый блок</h3>
          <div className="flex gap-4">
            <input
              type="text"
              value={newBlockName}
              onChange={(e) => setNewBlockName(e.target.value)}
              placeholder="Например: Блок Г (Розы)"
              className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button
              onClick={handleAdd}
              disabled={!newBlockName.trim()}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all"
            >
              <Plus size={20} />
              Добавить
            </button>
          </div>
        </div>

        {/* Blocks List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-2">Активные блоки ({blocks.length})</h3>
          
          {blocks.length === 0 && (
            <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                Блоки отсутствуют. Добавьте первый блок для начала работы.
            </div>
          )}

          {blocks.map((block) => (
            <div 
              key={block.id} 
              className="flex items-center justify-between p-4 bg-slate-900 border border-slate-700 rounded-xl group hover:border-blue-500/50 transition-colors"
            >
              {editingId === block.id ? (
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-slate-800 border border-blue-500 rounded px-3 py-2 text-white outline-none"
                    autoFocus
                  />
                  <button onClick={saveEdit} className="p-2 text-green-400 hover:bg-green-400/10 rounded">
                    <Check size={20} />
                  </button>
                  <button onClick={cancelEdit} className="p-2 text-slate-400 hover:bg-slate-700 rounded">
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                    <Warehouse size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{block.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">ID: {block.id}</p>
                  </div>
                </div>
              )}

              {editingId !== block.id && (
                <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => startEditing(block)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    title="Переименовать"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => onRemoveBlock(block.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Удалить блок"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
