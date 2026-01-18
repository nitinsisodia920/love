
import React from 'react';
import { GIFTS } from '../constants';
import { Gift } from '../types';
import { X, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSend: (gift: Gift) => void;
}

const GiftModal: React.FC<Props> = ({ isOpen, onClose, onSend }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 w-full max-w-md rounded-t-[2.5rem] border-t border-white/10 p-8 animate-in slide-in-from-bottom-full duration-500 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Send a Gift</h2>
            <p className="text-slate-400 text-sm">Brighten Maya's day and grow your bond</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-white/5 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {GIFTS.map(gift => (
            <button 
              key={gift.id}
              onClick={() => onSend(gift)}
              className="group flex flex-col items-center gap-3 p-6 rounded-3xl bg-slate-800/50 border border-white/5 hover:border-rose-500/50 hover:bg-rose-500/5 transition-all"
            >
              <span className="text-4xl group-hover:scale-125 transition-transform">{gift.icon}</span>
              <div className="text-center">
                <span className="block text-white font-semibold">{gift.name}</span>
                <span className="flex items-center justify-center gap-1 text-[10px] text-rose-400 font-bold uppercase tracking-wider mt-1">
                  <Sparkles size={10} /> +{gift.bondBonus}% Bond
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GiftModal;
