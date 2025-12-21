
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

const PRIORITY_3D_ITEMS = ['Camiseta Polo', 'Camiseta Manga Longa', 'Regata'];

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
      <div className="relative">
        <input
            type="text"
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-gray-800 p-4 pl-12 rounded-2xl text-[11px] font-black text-gray-300 outline-none focus:border-red-600 transition-all placeholder:text-gray-800 uppercase tracking-widest shadow-inner"
        />
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="bg-black/50 border border-gray-800 rounded-2xl p-3 max-h-64 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col gap-2">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => {
              const selection = selectedCategories.find(c => c.name === category);
              const isSelected = !!selection;
              const is3DPriority = PRIORITY_3D_ITEMS.includes(category);
              
              return (
                <div 
                  key={category} 
                  className={`flex flex-col gap-3 p-3 rounded-2xl transition-all border ${
                    isSelected ? 'bg-red-900/5 border-red-600/30' : 'hover:bg-gray-800/40 border-transparent text-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-4 cursor-pointer flex-grow">
                      <div className={`flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-lg border-2 transition-all ${isSelected ? 'bg-red-600 border-red-600' : 'bg-transparent border-gray-800'}`}>
                         {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleCategory(category)} className="hidden" />
                      <span className={`text-[10px] font-black uppercase tracking-widest truncate ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                        {category}
                      </span>
                    </label>
                    {is3DPriority && !isSelected && <span className="text-[7px] font-black text-red-500 uppercase tracking-widest px-2 py-0.5 bg-red-600/10 rounded">3D</span>}
                  </div>

                  {isSelected && (
                    <div className="flex gap-2 animate-fade-in pl-9">
                        <button onClick={() => setMode(category, 'standard')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${selection.mode === 'standard' ? 'bg-white text-black border-white' : 'bg-black/40 border-gray-800 text-gray-600'}`}>FOTO</button>
                        <button onClick={() => setMode(category, '3d')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${selection.mode === '3d' ? 'bg-red-600 text-white border-red-600' : 'bg-black/40 border-gray-800 text-gray-600'}`}>3D</button>
                        <button onClick={() => setMode(category, 'both')} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase border-2 transition-all ${selection.mode === 'both' ? 'bg-gray-400 text-black border-gray-400' : 'bg-black/40 border-gray-800 text-gray-600'}`}>MIX</button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-gray-800 text-[10px] font-black uppercase tracking-widest">Nenhum produto encontrado</div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center px-2">
         <span className={`text-[9px] font-black uppercase tracking-widest ${isOverLimit ? 'text-red-500' : 'text-gray-700'}`}>
           {selectedCategories.length === 0 ? 'SELECIONE AO MENOS UM' : `${selectedCategories.length} PRODUTOS SELECIONADOS`}
         </span>
         {selectedCategories.length > 0 && <button onClick={() => onSelectionChange([])} className="text-[9px] font-black text-gray-600 hover:text-red-500 uppercase tracking-widest transition-colors">Limpar Tudo</button>}
      </div>
    </div>
  );
};
