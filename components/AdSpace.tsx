
import React from 'react';

interface AdSpaceProps {
  type: 'horizontal' | 'vertical' | 'square';
  className?: string;
}

export const AdSpace: React.FC<AdSpaceProps> = ({ type, className = '' }) => {
  const dimensions = {
    horizontal: 'w-full h-24 sm:h-36',
    vertical: 'w-full h-[500px]',
    square: 'w-full aspect-square'
  };

  return (
    <div className={`relative overflow-hidden rounded-[3rem] border border-brand-orange/20 bg-gradient-to-br from-brand-dark via-brand-surface to-brand-dark flex flex-col items-center justify-center group shadow-2xl transition-all ${dimensions[type]} ${className}`}>
      <div className="absolute top-4 left-6 px-4 py-1.5 bg-brand-orange/10 border border-brand-orange/30 rounded-full text-[9px] font-black text-brand-orange uppercase tracking-[0.5em] z-10 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
        PREMIUM SPONSOR
      </div>
      
      <div className="flex flex-col items-center gap-4 opacity-40 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-105">
        <div className="w-16 h-16 rounded-[1.5rem] bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 shadow-inner">
            <svg className="w-8 h-8 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <div className="flex flex-col items-center">
            <p className="text-[12px] font-black uppercase tracking-[0.6em] text-white">Seu Branding Aqui</p>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-brand-orange mt-1">Impulsione sua agência hoje</p>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-tr from-brand-red/5 via-transparent to-brand-orange/5 pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-orange/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
};
