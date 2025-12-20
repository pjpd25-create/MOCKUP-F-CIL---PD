
import React from 'react';
import { MATERIAL_OPTIONS } from '../constants';

interface ColorSelectorProps {
  colors: string[];
  selectedColor: string;
  onSelectColor: (color: string) => void;
  selectedMaterial: string;
  onSelectMaterial: (materialId: string) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({ 
    colors, 
    selectedColor, 
    onSelectColor,
    selectedMaterial,
    onSelectMaterial
}) => {
  return (
    <div className="space-y-6">
      {/* Seletor de Cor Base */}
      <div className="relative group">
        <select
          value={selectedColor}
          onChange={(e) => onSelectColor(e.target.value)}
          className="w-full appearance-none bg-black border border-gray-800 text-gray-200 py-4 px-4 pr-10 rounded-2xl leading-tight focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all duration-300 font-bold text-[11px] uppercase tracking-widest shadow-inner"
        >
          {colors.map((color) => (
            <option key={color} value={color} className="bg-gray-900">
              {color}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-red-500">
          <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>

      {/* Seletor de Material/Textura */}
      <div>
        <label className="text-[9px] font-black text-gray-500 uppercase mb-4 block tracking-[0.2em]">Textura & Material do Produto</label>
        <div className="grid grid-cols-2 gap-2">
            {MATERIAL_OPTIONS.map((mat) => {
                const isSelected = selectedMaterial === mat.id;
                return (
                    <button
                        key={mat.id}
                        onClick={() => onSelectMaterial(mat.id)}
                        className={`p-3 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col gap-1 ${
                            isSelected 
                            ? 'border-red-600 bg-red-600/10 shadow-[0_0_15px_rgba(220,38,38,0.2)]' 
                            : 'border-gray-800 bg-black/40 hover:border-gray-700 hover:bg-black/60'
                        }`}
                    >
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                            {mat.label}
                        </span>
                        <span className="text-[8px] font-medium text-gray-600 lowercase leading-tight">
                            {mat.description}
                        </span>
                        {isSelected && (
                             <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,1)]" />
                        )}
                    </button>
                );
            })}
        </div>
      </div>
    </div>
  );
};
