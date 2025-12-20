
import React, { useState, useMemo } from 'react';
import { PhotoIcon, CubeIcon } from './icons';

export type MockupMode = 'standard' | '3d' | 'both';

export interface SelectedCategory {
  name: string;
  mode: MockupMode;
}

interface CategorySelectorProps {
  categories: string[];
  selectedCategories: SelectedCategory[];
  onSelectionChange: (categories: SelectedCategory[]) => void;
  maxSelection?: number;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ categories, selectedCategories, onSelectionChange, maxSelection }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const lowerTerm = searchTerm.toLowerCase();
    return categories.filter(c => c.toLowerCase().includes(lowerTerm));
  }, [categories, searchTerm]);

  const toggleCategory = (categoryName: string) => {
    const existing = selectedCategories.find(c => c.name === categoryName);
    let newSelected: SelectedCategory[];

    if (existing) {
      newSelected = selectedCategories.filter(c => c.name !== categoryName);
    } else {
      if (maxSelection && selectedCategories.length >= maxSelection) return;
      newSelected = [...selectedCategories, { name: categoryName, mode: 'standard' }];
    }

    onSelectionChange(newSelected);
  };

  const setMode = (categoryName: string, mode: MockupMode) => {
    onSelectionChange(selectedCategories.map(c => 
      c.name === categoryName ? { ...c, mode } : c
    ));
  };

  const isOverLimit = maxSelection && selectedCategories.length > maxSelection;

  return (
    <div className="w-full space-y-4">
      {/* Barra de Busca Dark */}
      <div className="relative group">
        <input
            type="text"
            placeholder="Buscar produto (ex: Camiseta, Caneca...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-red-900/20 p-4 pl-12 rounded-2xl text-[11px] font-black text-gray-300 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-gray-700 shadow-inner uppercase tracking-widest"
        />
        <svg 
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-700 group-focus-within:text-red-500 transition-colors" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div 
        className="bg-black/50 border border-gray-800 rounded-[2rem] p-3 max-h-72 overflow-y-auto transition-all duration-300 scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-transparent shadow-2xl"
      >
        <div className="flex flex-col gap-2">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => {
              const selection = selectedCategories.find(c => c.name === category);
              const isSelected = !!selection;
              
              return (
                <div 
                  key={category} 
                  className={`flex flex-col gap-3 p-3 rounded-2xl transition-all duration-300 border ${
                    isSelected 
                      ? 'bg-red-900/10 border-red-600/50 shadow-[0_0_20px_rgba(220,38,38,0.1)]' 
                      : 'hover:bg-gray-800/40 border-transparent text-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-4 cursor-pointer flex-grow">
                      <div className={`flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-lg border-2 transition-all ${isSelected ? 'bg-red-600 border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-transparent border-gray-700'}`}>
                         {isSelected && (
                           <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                           </svg>
                         )}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCategory(category)}
                        className="hidden"
                      />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                        {category}
                      </span>
                    </label>
                  </div>

                  {/* Seleção de Modo Individual */}
                  {isSelected && (
                    <div className="flex gap-1.5 animate-fade-in pl-9">
                        <button 
                            onClick={() => setMode(category, 'standard')}
                            title="Foto Realística"
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter border-2 transition-all ${selection.mode === 'standard' ? 'bg-white text-black border-white shadow-lg' : 'bg-black/40 border-gray-800 text-gray-500 hover:border-gray-600'}`}
                        >
                            <PhotoIcon className="h-3.5 w-3.5" /> FOTO
                        </button>
                        <button 
                            onClick={() => setMode(category, '3d')}
                            title="Renderização 3D"
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter border-2 transition-all ${selection.mode === '3d' ? 'bg-red-600 text-white border-red-600 shadow-lg' : 'bg-black/40 border-gray-800 text-gray-500 hover:border-gray-600'}`}
                        >
                            <CubeIcon className="h-3.5 w-3.5" /> 3D
                        </button>
                        <button 
                            onClick={() => setMode(category, 'both')}
                            title="Gerar as Duas Versões"
                            className={`flex-1 flex items-center justify-center py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter border-2 transition-all ${selection.mode === 'both' ? 'bg-gradient-to-r from-white to-red-600 text-black border-white' : 'bg-black/40 border-gray-800 text-gray-500 hover:border-gray-600'}`}
                        >
                            AMBOS
                        </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-gray-700 text-[10px] font-black uppercase tracking-[0.3em] italic">
                Sem correspondência para "{searchTerm}"
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center px-1">
         <span className={`text-[10px] font-black uppercase tracking-widest ${isOverLimit ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
           {selectedCategories.length === 0 ? 'SELECIONE PRODUTOS' : 
            `${selectedCategories.length} ${selectedCategories.length === 1 ? 'SELECIONADO' : 'SELECIONADOS'}`}
         </span>
         {selectedCategories.length > 0 && (
            <button 
                onClick={() => onSelectionChange([])}
                className="text-[9px] font-black text-gray-500 hover:text-red-500 uppercase tracking-widest transition-colors"
            >
                Limpar Todos
            </button>
         )}
      </div>
    </div>
  );
};
