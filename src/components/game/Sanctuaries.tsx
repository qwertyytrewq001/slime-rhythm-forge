import React from 'react';
import { IslandGrid } from './IslandGrid';

interface SanctuariesProps {
  onClose?: () => void;
}

export function Sanctuaries({ onClose }: SanctuariesProps) {
  return (
    <div className="fixed inset-0 z-[200]">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("/second_screen_background.png")' 
        }}
      />
      
      {/* Close Button */}
      <div className="relative z-10 flex justify-end p-8">
        <button
          onClick={onClose}
          className="px-6 py-3 bg-black/80 backdrop-blur-md text-[#FF7EB6] text-[14px] font-bold rounded-lg hover:bg-black/90 transition-all duration-200"
          style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
          Close
        </button>
      </div>
      
      {/* Island Grid - Full Screen */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="w-full max-w-7xl">
          <IslandGrid onHabitatClick={() => {}} />
        </div>
      </div>
    </div>
  );
}
