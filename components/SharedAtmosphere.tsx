
import React, { useState } from 'react';
import { Music, Pause, Play, Heart } from 'lucide-react';

const SharedAtmosphere: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <div className="px-6 py-2 bg-pink-50/50 backdrop-blur-md border-b border-pink-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center text-pink-400 shadow-sm border border-pink-50 transition-all ${isPlaying ? 'animate-spin-slow' : ''}`}>
          <Music size={14} />
        </div>
        <div>
          <p className="text-[9px] text-pink-400 font-black uppercase tracking-wider flex items-center gap-1">
            Now Vibe-ing <Heart size={8} fill="currentColor" />
          </p>
          <p className="text-[11px] text-slate-600 font-bold truncate max-w-[120px]">Sweet Pastel Lo-fi</p>
        </div>
      </div>
      
      <button 
        onClick={() => setIsPlaying(!isPlaying)} 
        className="w-10 h-10 bg-white shadow-sm border border-pink-100 rounded-full flex items-center justify-center text-pink-500 active:scale-90 transition-all"
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
      </button>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SharedAtmosphere;
