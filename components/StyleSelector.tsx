

import React from 'react';

interface StyleSelectorProps {
  styles: string[];
  selectedStyle: string;
  onSelectStyle: (style: string) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ styles, selectedStyle, onSelectStyle }) => {
  return (
    <div className="relative">
      <select
        value={selectedStyle}
        onChange={(e) => onSelectStyle(e.target.value)}
        className="w-full appearance-none bg-gray-800 border border-gray-600 text-gray-200 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all duration-200"
      >
        {styles.map((style) => (
          <option key={style} value={style}>
            {style}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-red-500">
        <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};