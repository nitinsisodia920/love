
import React from 'react';
import { Memory } from '../types';
import { Book, Star, Heart, Flower } from 'lucide-react';

interface Props {
  memories: Memory[];
}

const MemoryVault: React.FC<Props> = ({ memories }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar animate-in slide-in-from-right-5 duration-500 pb-24">
      <div className="text-center py-2">
        <h2 className="text-2xl font-black text-pink-600 flex items-center justify-center gap-2">
          <Book className="text-pink-400" size={24} /> Our Secret
        </h2>
        <p className="text-slate-400 text-xs mt-1 font-medium">Sweet moments she won't forget ✨</p>
      </div>

      {memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 opacity-50">
          <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center text-pink-300">
            <Heart size={32} />
          </div>
          <p className="text-slate-500 text-sm font-bold">Empty space for our love...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {memories.map(m => (
            <div key={m.id} className="bg-white border-2 border-pink-50 p-5 rounded-3xl shadow-sm hover:border-pink-200 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-pink-50 rounded-lg text-pink-400">
                  {m.category === 'preference' ? <Star size={14} fill="currentColor" /> : <Flower size={14} />}
                </div>
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{m.category}</span>
              </div>
              <p className="text-slate-700 text-[15px] font-medium leading-relaxed italic">"{m.text}"</p>
              <div className="mt-4 text-right">
                <span className="text-[10px] font-bold text-pink-300">{m.timestamp.toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoryVault;
