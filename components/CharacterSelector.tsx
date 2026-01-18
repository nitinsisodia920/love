
import React from 'react';
import { CHARACTERS } from '../constants';
import { Character } from '../types';
import { Heart, Sparkles, User } from 'lucide-react';

interface Props {
  onSelect: (character: Character) => void;
}

const CharacterSelector: React.FC<Props> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight flex items-center justify-center gap-3">
          <Heart className="text-rose-500 fill-rose-500" />
          Soulmate AI
        </h1>
        <p className="text-slate-400 text-lg">Choose your companion to begin your journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {CHARACTERS.map((char) => (
          <div 
            key={char.id}
            onClick={() => onSelect(char)}
            className="group relative bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 hover:border-rose-500/50 transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-rose-500/10"
          >
            <div className="aspect-[4/5] relative">
              <img 
                src={char.avatarUrl} 
                alt={char.name}
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{char.name}, {char.age}</h3>
                    <p className="text-rose-400 font-medium text-sm flex items-center gap-1">
                      <Sparkles size={14} />
                      {char.role}
                    </p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm line-clamp-2">{char.personality}</p>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {char.interests.map(interest => (
                    <span key={interest} className="px-2 py-1 bg-slate-700/50 rounded-full text-[10px] text-slate-300 uppercase tracking-wider">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-slate-500 text-sm flex items-center gap-2">
        <User size={16} />
        Your conversations are private and secure
      </p>
    </div>
  );
};

export default CharacterSelector;
