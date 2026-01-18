
import React, { useState } from 'react';
import { Music, Pause, Play, Heart, Disc } from 'lucide-react';

const SharedAtmosphere: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <div className="px-6 py-4 bg-white/5 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`relative ${isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''}`}>
           <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,77,109,0.3)]">
              <Disc size={20} />
           </div>
           {isPlaying && (
             <div className="absolute -top-1 -right-1">
                <Music size={12} className="text-rose-400 animate-bounce" />
             </div>
           )}
        </div>
        <div className="flex flex-col">
          <p className="text-[9px] text-rose-400 font-black uppercase tracking-[0.2em] flex items-center gap-1 leading-none">
            Hamara Vibe <Heart size={8} fill="currentColor" />
          </p>
          <p className="text-[13px] text-white/80 font-bold truncate max-w-[150px] mt-1">Hinglish Love Lofi</p>
        </div>
      </div>
      
      <button 
        onClick={() => setIsPlaying(!isPlaying)} 
        className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-rose-400 transition-all border border-white/5 active:scale-95"
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
      </button>
    </div>
  );
};

export default SharedAtmosphere;
