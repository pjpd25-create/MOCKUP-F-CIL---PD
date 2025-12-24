
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
    
    if (p.includes('costas') || p.includes('back') || p.includes('verso') || p.includes('traseira') || p.includes('nuca')) {
        view = 'traseira';
    } else if (p.includes('lateral') || p.includes('side')) {
        view = 'lateral';
    } else if (p.includes('topo') || p.includes('top') || p.includes('tampa') || p.includes('aba')) {
        view = 'topo';
    }

    if (type === 'apparel') {
        if (view === 'frente') {
            target = { x: 50, y: 40 }; 
            if (p.includes('peito esquerdo')) target = { x: 35, y: 35 }; 
            if (p.includes('peito direito')) target = { x: 65, y: 35 }; 
        } else if (view === 'traseira') {
            target = { x: 50, y: 45 }; 
        }
    } else if (type === 'headwear') {
        target = { x: 50, y: 42 };
    } else if (type === 'drinkware') {
        target = { x: 50, y: 45 };
    }

    const baseStyle = "fill-brand-red/10 stroke-brand-red/40 stroke-[0.5] transition-all duration-300";
    
    const getIcon = () => {
        if (type === 'apparel') {
            return <path d="M6 8 L4 9 L6 18 L18 18 L20 9 L18 8 L15 7 L12 9 L9 7 Z" className={baseStyle} />;
        }
        if (type === 'headwear') {
            return <path d="M4 14 C4 8 8 5 12 5 C16 5 20 8 20 14 L22 16 L2 16 L4 14 Z" className={baseStyle} />;
        }
        if (type === 'drinkware') {
            return <path d="M7 6 L17 6 L16 20 L8 20 Z" className={baseStyle} />;
        }
        return <rect x="5" y="5" width="14" height="14" rx="1" className={baseStyle} />;
    };

    return (
        <svg viewBox="0 0 24 24" className="w-16 h-16 mb-6 drop-shadow-[0_0_10px_rgba(220,38,38,0.2)] overflow-visible">
            {getIcon()}
            <g className="animate-pulse">
                <circle cx={(target.x / 100) * 24} cy={(target.y / 100) * 24} r="3" className="fill-brand-orange shadow-[0_0_20px_rgba(249,115,22,1)]" />
                <circle cx={(target.x / 100) * 24} cy={(target.y / 100) * 24} r="6" className="stroke-brand-orange/30 fill-none stroke-[0.5]" />
            </g>
        </svg>
    )
}

export const PlacementSelector: React.FC<PlacementSelectorProps> = ({ placements, selectedPlacement, onSelectPlacement, disabled = false, currentCategory }) => {
  const categoryType = currentCategory ? getCategoryType(currentCategory) : 'generic';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <label className="text-[11px] font-black text-brand-orange uppercase tracking-[0.3em] block">Mapa de Projeção</label>
      </div>
      <div className={`grid grid-cols-2 gap-4 ${disabled ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
        {placements.map((placement) => {
          const isSelected = selectedPlacement === placement;
          return (
              <button
                key={placement}
                onClick={() => onSelectPlacement(placement)}
                className={`flex flex-col items-center justify-center p-6 rounded-[3rem] border-2 transition-all duration-500 group relative overflow-hidden h-44 ${
                    isSelected 
                        ? 'bg-brand-orange/10 border-brand-orange shadow-[0_20px_50px_rgba(249,115,22,0.2)] scale-[1.05] z-10' 
                        : 'bg-white/5 border-white/5 text-gray-700 hover:border-brand-orange/30 hover:bg-white/10'
                }`}
              >
                <VisualIcon type={categoryType} placement={placement} />
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-center leading-tight transition-all ${isSelected ? 'text-white' : 'text-gray-700 group-hover:text-gray-400'}`}>
                    {placement}
                </span>
                {isSelected && <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-brand-red to-brand-orange shadow-[0_0_15px_rgba(249,115,22,1)]" />}
              </button>
          );
        })}
      </div>
    </div>
  );
};
