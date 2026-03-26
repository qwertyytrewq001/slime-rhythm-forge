import React from 'react';
import { IslandGrid } from './IslandGrid';

interface SanctuariesProps {
  onClose?: () => void;
}

export function Sanctuaries({ onClose }: SanctuariesProps) {
  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("/second_screen_background.png")' 
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="bg-black/60 backdrop-blur-md rounded-2xl border-2 border-[#FF7EB6]/30 p-8 max-w-6xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-[#FF7EB6] mb-4">Sanctuaries</h2>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-[#FF7EB6] text-white rounded-lg hover:bg-[#FF9DB5] transition-colors"
            >
              Close
            </button>
          </div>
          
          {/* Island Grid */}
          <IslandGrid />
        </div>
      </div>
    </div>
  );
}
