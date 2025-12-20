
import React, { useEffect } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

interface LightboxProps {
  isOpen: boolean;
  image: string | null;
  category?: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  currentIndex: number;
  totalImages: number;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  image,
  category,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  currentIndex,
  totalImages
}) => {
  // Handle Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
          if (hasNext) onNext();
          break;
        case 'ArrowLeft':
          if (hasPrev) onPrev();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Lock scroll
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, hasNext, hasPrev, onNext, onPrev, onClose]);

  if (!isOpen || !image) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/60 to-transparent">
         <div className="text-gray-300 text-sm font-medium px-2">
            {currentIndex + 1} / {totalImages}
            {category && <span className="ml-3 px-2 py-1 bg-white/20 rounded text-xs text-white">{category}</span>}
         </div>
         <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
            aria-label="Fechar"
         >
            <XMarkIcon className="h-8 w-8" />
         </button>
      </div>

      {/* Navigation Left */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all z-50"
        >
          <ChevronLeftIcon className="h-10 w-10" />
        </button>
      )}

      {/* Image Container */}
      <div 
        className="relative max-w-full max-h-full p-4 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
      >
        <img 
            src={`data:image/png;base64,${image}`} 
            alt="Full Screen Mockup" 
            className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl select-none"
        />
      </div>

      {/* Navigation Right */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all z-50"
        >
          <ChevronRightIcon className="h-10 w-10" />
        </button>
      )}
    </div>
  );
};
