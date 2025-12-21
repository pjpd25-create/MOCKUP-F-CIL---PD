
import React from 'react';
import { getCategoryType } from '../constants';

interface PlacementSelectorProps {
  placements: string[];
  selectedPlacement: string;
  onSelectPlacement: (placement: string) => void;
  disabled?: boolean;
  currentCategory?: string;
}

const VisualIcon = ({ type, placement }: { type: string, placement: string }) => {
    const p = placement.toLowerCase();
    let target = { x: 50, y: 50 };
    let view: 'frente' | 'traseira' | 'lateral' | 'topo' = 'frente';
    
    // Detecção de Verso em Português e Fallback
    if (p.includes('costas') || p.includes('back') || p.includes('verso') || p.includes('traseira') || p.includes('nuca')) {
        view = 'traseira';
    } else if (p.includes('lateral') || p.includes('side')) {
        view = 'lateral';
    } else if (p.includes('topo') || p.includes('top') || p.includes('tampa') || p.includes('aba')) {
        view = 'topo';
    }

    // Coordenadas refinadas para posicionamento 3D
    if (type === 'apparel') {
        if (view === 'frente') {
            target = { x: 50, y: 40 }; 
            if (p.includes('peito esquerdo')) target = { x: 35, y: 35 }; 
            if (p.includes('peito direito')) target = { x: 65, y: 35 }; 
            if (p.includes('manga esquerda')) target = { x: 20, y: 40 };
            if (p.includes('manga direita')) target = { x: 80, y: 40 };
        } else if (view === 'traseira') {
            target = { x: 50, y: 45 }; 
            if (p.includes('nuca')) target = { x: 50, y: 22 };
        }
    } else if (type === 'headwear') {
        if (view === 'topo') {
            target = { x: 50, y: 25 };
        } else if (view === 'lateral') {
            target = p.includes('esquerda') ? { x: 30, y: 50 } : { x: 70, y: 50 };
        } else if (view === 'traseira') {
            target = { x: 50, y: 65 };
        } else {
            target = { x: 50, y: 42 };
        }
    } else if (type === 'drinkware') {
        target = { x: 50, y: 45 };
        if (p.includes('traseira')) target = { x: 50, y: 45 };
    } else if (type === 'stationery' || type === 'books') {
        if (p.includes('esquerdo')) target = { x: 25, y: 25 };
        else if (p.includes('direito')) target = { x: 75, y: 25 };
        else if (p.includes('inferior')) target = { x: 75, y: 75 };
        else if (p.includes('lombada')) target = { x: 10, y: 50 };
        else target = { x: 50, y: 50 };
    }

    const baseStyle = "fill-gray-800/50 stroke-gray-600 stroke-1 transition-all duration-300";
    
    const getIcon = () => {
        if (type === 'apparel') {
            if (view === 'traseira') {
                return (
                    <g className={baseStyle}>
                        <path d="M6 8 L4 9 L6 18 L18 18 L20 9 L18 8 L15 7 L12 8 L9 7 Z" />
                        <path d="M12 8 C10 8 9 7 9 7 L8 6 L12 5 L16 6 L15 7 C15 7 14 8 12 8 Z" className="fill-gray-700/50" />
                    </g>
                );
            }
            return (
                <g className={baseStyle}>
                    <path d="M6 8 L4 9 L6 18 L18 18 L20 9 L18 8 L15 7 L12 9 L9 7 Z" />
                    <path d="M12 9 C10 9 9 7 9 7 L8 6 L12 5 L16 6 L15 7 C15 7 14 9 12 9 Z" className="fill-gray-700/50" />
                </g>
            );
        }
        if (type === 'headwear') {
            return (
                <g className={baseStyle}>
                    <path d="M4 14 C4 8 8 5 12 5 C16 5 20 8 20 14 L22 16 L2 16 L4 14 Z" />
                    <path d="M10 5 L12 4 L14 5" className="stroke-2" />
                </g>
            );
        }
        if (type === 'drinkware') {
            return (
                <g className={baseStyle}>
                    <path d="M7 6 L17 6 L16 20 L8 20 Z" />
                    <path d="M7 6 C7 5 8 4 12 4 C16 4 17 5 17 6" />
                </g>
            );
        }
        return (
            <g className={baseStyle}>
                <rect x="5" y="5" width="14" height="14" rx="1" />
            </g>
        );
    };

    const labelMap = {
        frente: 'Frente',
        traseira: 'Traseira',
        lateral: 'Lateral',
        topo: 'Superior'
    };

    return (
        <svg viewBox="0 0 24 24" className="w-12 h-12 mb-3 drop-shadow-lg overflow-visible">
            {getIcon()}
            <g className="animate-pulse">
                <circle cx={(target.x / 100) * 24} cy={(target.y / 100) * 24} r="3" className="fill-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                <circle cx={(target.x / 100) * 24} cy={(target.y / 100) * 24} r="5" className="stroke-red-500/30 fill-none stroke-1" />
            </g>
        </svg>
    )
}

export const PlacementSelector: React.FC<PlacementSelectorProps> = ({ placements, selectedPlacement, onSelectPlacement, disabled = false, currentCategory }) => {
  const categoryType = currentCategory ? getCategoryType(currentCategory) : 'generic';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Localização 3D</label>
        {selectedPlacement && (
            <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter bg-red-600/10 px-2 py-0.5 rounded border border-red-600/20">{selectedPlacement}</span>
        )}
      </div>
      <div className={`grid grid-cols-2 gap-2 ${disabled ? 'opacity-30 pointer-events-none' : ''}`}>
        {placements.map((placement) => {
          const isSelected = selectedPlacement === placement;
          return (
              <button
                key={placement}
                onClick={() => onSelectPlacement(placement)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 group relative overflow-hidden h-32 ${
                    isSelected 
                        ? 'bg-red-600/5 border-red-600 shadow-xl scale-[1.02] z-10' 
                        : 'bg-black/40 border-gray-800 text-gray-500 hover:border-gray-700 hover:bg-black/60'
                }`}
              >
                {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-red-600/5 to-transparent opacity-50" />
                )}
                
                <VisualIcon type={categoryType} placement={placement} />
                
                <span className={`text-[8px] font-black uppercase tracking-widest text-center leading-tight transition-colors duration-300 ${isSelected ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'}`}>
                    {placement}
                </span>

                {isSelected && (
                    <div className="absolute top-2 right-2">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                    </div>
                )}
              </button>
          );
        })}
      </div>
    </div>
  );
};
