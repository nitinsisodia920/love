
import React from 'react';
import { Memory } from '../types';
import { Book, Star, Heart, Flower, Plus, Lock } from 'lucide-react';

interface Props {
  memories: Memory[];
}

const MemoryVault: React.FC<Props> = ({ memories }) => {
  return (
    <div className="flex-1 overflow-y-auto px-6 pt-8 pb-40 no-scrollbar animate-in slide-in-from-right-10 duration-700">
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem] flex items-center justify-center text-rose-500 shadow-2xl shadow-rose-500/10 mb-6 rotate-6 transition-transform hover:rotate-0">
          <Lock size={36} />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">Hamari Yaadein</h2>
        <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.3em] mt-2">Locked just for us</p>
      </div>

      {memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center px-10 bg-white/5 rounded-[3rem] border border-white/5">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/10 mb-6">
            <Plus size={32} />
          </div>
          <p className="text-white/30 font-bold text-xs uppercase tracking-widest leading-loose">Talk to me more to unlock memories here ✨</p>
        </div>
      ) : (
        <div className="space-y-6">
          {memories.map((m, idx) => (
            <div 
              key={m.id} 
              className={`bg-white/5 backdrop-blur-md border border-white/5 p-6 rounded-[2.5rem] hover:bg-white/10 transition-all duration-500 group relative
                ${idx % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}
            >
              <div className="absolute top-4 right-6 text-rose-500/10 group-hover:text-rose-500/20 transition-colors">
                 <Heart size={40} fill="currentColor" />
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${m.category === 'preference' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {m.category === 'preference' ? <Star size={14} fill="currentColor" /> : <Heart size={14} />}
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{m.category}</span>
              </div>
              
              <p className="text-white/80 text-[16px] font-medium leading-relaxed font-handwritten italic">
                 "{m.text}"
              </p>
              
              <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">
                  {m.timestamp.toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoryVault;
