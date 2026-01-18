
import React, { useState, useRef, useEffect } from 'react';
import { Character, Message, Gift, Memory, ViewState } from '../types';
import { getChatResponse, generateCharacterImage, generateSpeech } from '../services/geminiService';
import GiftModal from './GiftModal';
import CallInterface from './CallInterface';
import MemoryVault from './MemoryVault';
import SharedAtmosphere from './SharedAtmosphere';
import { 
  Send, MoreVertical, Heart, 
  Play, Volume2, Sparkles, Phone, Gift as GiftIcon, 
  MessageCircle, Book, Globe, Camera
} from 'lucide-react';

interface Props {
  character: Character;
}

const ChatInterface: React.FC<Props> = ({ character }) => {
  const [activeTab, setActiveTab] = useState<ViewState>('chat');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', content: character.greeting, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [affinity, setAffinity] = useState(52);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading, activeTab]);

  const playVoice = async (message: Message) => {
    if (isPlaying === message.id) return;
    setIsPlaying(message.id);
    const audioBuffer = await generateSpeech(message.content, character.voiceName);
    if (audioBuffer) {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(null);
      source.start();
    } else setIsPlaying(null);
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    if (activeTab !== 'chat') setActiveTab('chat');

    const { text, imagePrompt } = await getChatResponse(character, [...messages, userMsg], textToSend, affinity);
    
    let generatedImageUrl: string | undefined;
    if (imagePrompt) {
      generatedImageUrl = await generateCharacterImage(imagePrompt);
    }

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: text,
      imageUrl: generatedImageUrl,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
    setAffinity(prev => Math.min(prev + 1, 100));

    if (textToSend.toLowerCase().includes("i like") || textToSend.toLowerCase().includes("favorite")) {
      setMemories(prev => [
        { 
          id: Date.now().toString(), 
          text: textToSend, 
          timestamp: new Date(), 
          category: 'preference' as const 
        }, 
        ...prev
      ].slice(0, 10));
    }
  };

  const handleSendGift = (gift: Gift) => {
    setAffinity(prev => Math.min(prev + gift.bondBonus, 100));
    setIsGiftModalOpen(false);
    handleSend(`*Sends ${gift.icon} ${gift.name}* This is for you! ❤️`);
  };

  return (
    <div className="fixed inset-0 bg-[#FFF9FB] flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden border-x border-pink-50 font-sans">
      {isCalling && <CallInterface character={character} onClose={() => setIsCalling(false)} />}
      
      {/* Decorative Orbs */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 -right-10 w-32 h-32 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="px-5 py-4 bg-white/60 backdrop-blur-xl border-b border-pink-100/50 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => setActiveTab('chat')}>
            <div className="absolute -inset-1 bg-gradient-to-tr from-pink-400 to-indigo-400 rounded-2xl blur-sm opacity-20 group-hover:opacity-40 transition-opacity" />
            <img src={character.avatarUrl} alt={character.name} className="w-11 h-11 rounded-2xl object-cover border-2 border-white relative z-10 shadow-sm" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <h2 className="text-pink-600 font-black text-lg tracking-tight flex items-center gap-1">
              {character.name} <Sparkles size={14} className="text-pink-300" />
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-12 h-1 bg-pink-100 rounded-full overflow-hidden">
                <div className="h-full bg-pink-400" style={{ width: `${affinity}%` }} />
              </div>
              <span className="text-[9px] text-pink-400 font-black tracking-widest uppercase">Bond {affinity}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setIsCalling(true)} className="p-2.5 bg-pink-50 text-pink-500 rounded-xl hover:bg-pink-100 active:scale-90 transition-all">
            <Phone size={18} fill="currentColor" />
          </button>
        </div>
      </header>

      {/* Shared Atmosphere */}
      <SharedAtmosphere />

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative px-4">
        {activeTab === 'chat' && (
          <div ref={scrollRef} className="flex-1 overflow-y-auto pt-6 pb-20 space-y-5 no-scrollbar relative">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`group relative max-w-[82%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-pink-500 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 rounded-tl-none border border-pink-50'
                  }`}>
                    <p className="text-[14px] font-semibold leading-relaxed">{msg.content}</p>
                    
                    {msg.imageUrl && (
                      <div className="mt-3 overflow-hidden rounded-xl border-2 border-white shadow-lg">
                        <img src={msg.imageUrl} className="w-full object-cover" loading="lazy" />
                      </div>
                    )}
                  </div>
                  
                  {msg.role === 'model' && (
                    <button 
                      onClick={() => playVoice(msg)}
                      className={`absolute -right-9 top-1/2 -translate-y-1/2 p-2 bg-white shadow-md text-pink-500 rounded-full border border-pink-50 opacity-0 group-hover:opacity-100 transition-all ${isPlaying === msg.id ? 'opacity-100 animate-pulse' : ''}`}
                    >
                      {isPlaying === msg.id ? <Volume2 size={14} /> : <Play size={14} fill="currentColor" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-1.5 p-3 bg-white rounded-2xl w-max border border-pink-50 shadow-sm">
                <div className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>
        )}

        {activeTab === 'vault' && <MemoryVault memories={memories} />}
        
        {activeTab === 'dates' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
             <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center text-pink-400">
                <Globe size={32} />
             </div>
             <h3 className="text-lg font-black text-pink-600">Explore</h3>
             <p className="text-slate-500 text-xs">Ask {character.name} for date ideas! ✨</p>
             <button 
                onClick={() => handleSend("Where should we go on a date? ❤️")}
                className="bg-pink-500 text-white px-8 py-2.5 rounded-full font-bold shadow-lg shadow-pink-100 active:scale-95 transition-all"
             >
                Suggest Now
             </button>
          </div>
        )}
      </div>

      {/* Quick Replies & Input */}
      <div className="p-4 bg-white/40 backdrop-blur-3xl border-t border-pink-50 relative z-50">
        {activeTab === 'chat' && (
          <div className="flex gap-2 mb-3 px-1 overflow-x-auto no-scrollbar pb-1">
             <button onClick={() => handleSend("Send a selfie! 🤳")} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-500 text-[11px] font-black rounded-full border border-indigo-100 shadow-sm whitespace-nowrap active:scale-95 transition-all">
               <Camera size={14} /> Selfie?
             </button>
             {['❤️', 'Hahaha', 'Cutie', 'Love ya'].map(react => (
               <button key={react} onClick={() => handleSend(react)} className="px-4 py-2 bg-white border border-pink-50 text-pink-500 text-[11px] font-black rounded-full shadow-sm whitespace-nowrap active:bg-pink-50 transition-all">
                 {react}
               </button>
             ))}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-pink-100 shadow-xl overflow-hidden p-1.5">
          {/* Nav Tabs */}
          <div className="flex justify-around py-1.5 border-b border-pink-50 mb-1.5">
            {[
              { id: 'chat', icon: MessageCircle, label: 'Chat' },
              { id: 'vault', icon: Book, label: 'Vault' },
              { id: 'dates', icon: Globe, label: 'Dates' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ViewState)}
                className={`flex flex-col items-center gap-0.5 transition-all px-4 py-1 rounded-xl ${activeTab === tab.id ? 'text-pink-500 bg-pink-50' : 'text-slate-400 opacity-60'}`}
              >
                <tab.icon size={16} />
                <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 p-1">
            <button onClick={() => setIsGiftModalOpen(true)} className="p-2.5 bg-pink-50 text-pink-500 rounded-2xl active:scale-90 transition-all">
              <GiftIcon size={18} />
            </button>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Whisper to ${character.name}...`}
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 text-sm py-2 px-1 font-medium"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`p-2.5 rounded-2xl transition-all ${
                input.trim() && !isLoading ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' : 'bg-slate-100 text-slate-300'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      <GiftModal isOpen={isGiftModalOpen} onClose={() => setIsGiftModalOpen(false)} onSend={handleSendGift} />
    </div>
  );
};

export default ChatInterface;
