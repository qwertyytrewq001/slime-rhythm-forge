import React from 'react';
import { IslandGrid } from './IslandGrid';

interface SanctuariesProps {
  onClose?: () => void;
}

export function Sanctuaries({ onClose }: SanctuariesProps) {
  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{ 
          backgroundImage: 'url("/second_screen_background.png")' 
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="bg-black/80 backdrop-blur-xl rounded-3xl border-2 border-[#FF7EB6]/40 p-10 max-w-7xl max-h-[85vh] overflow-y-auto shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-black text-white" style={{ fontFamily: "'Press Start 2P', cursive", textShadow: '2px 2px 0px rgba(0,0,0,0.8), 0 0 20px rgba(255,126,182,0.6)' }}>
              Sanctuaries
            </h2>
            <button
              onClick={onClose}
              className="px-8 py-4 bg-[#FF7EB6] text-black text-[16px] font-bold rounded-xl hover:bg-[#FF9DB5] transition-all duration-200 hover:scale-105 shadow-lg"
              style={{ fontFamily: "'Press Start 2P', cursive" }}
            >
              Close
            </button>
          </div>
          
          {/* Island Grid */}
          <div className="mt-8">
            <IslandGrid onHabitatClick={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
}
