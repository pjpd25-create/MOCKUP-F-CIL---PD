
import React from 'react';

interface AdSpaceProps {
  type: 'horizontal' | 'vertical' | 'square';
  className?: string;
}

export const AdSpace: React.FC<AdSpaceProps> = ({ type, className = '' }) => {
  const dimensions = {
    horizontal: 'w-full h-24 sm:h-32',
    vertical: 'w-full h-[400px]',
    square: 'w-full aspect-square'
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-red-900/10 bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center group ${dimensions[type]} ${className}`}>
      {/* Marcador de Anúncio */}
      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 border border-white/5 rounded text-[7px] font-black text-gray-600 uppercase tracking-widest z-10">
        Anúncio
      </div>
      
      {/* Conteúdo Simulado do Ad */}
      <div className="flex flex-col items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
        <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Espaço Publicitário</p>
      </div>

      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
    </div>
  );
};
