
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
  MessageCircle, Book, Camera, AlertCircle, Clock, ExternalLink,
  MapPin, Coffee, Zap, User, Star
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
  const [affinity, setAffinity] = useState(72);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [voiceError, setVoiceError] = useState<{message: string, isQuota: boolean} | null>(null);
  const [isCooldown, setIsCooldown] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading, activeTab]);

  useEffect(() => {
    if (isCooldown) {
      const timer = setTimeout(() => setIsCooldown(false), 60000);
      return () => clearTimeout(timer);
    }
  }, [isCooldown]);

  const playVoice = async (message: Message) => {
    if (isPlaying === message.id || isCooldown) return;
    setIsPlaying(message.id);
    setVoiceError(null);

    const { buffer, error } = await generateSpeech(message.content, character.voiceName);
    
    if (buffer) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(null);
      source.start();
    } else {
      setIsPlaying(null);
      if (error === "QUOTA_EXHAUSTED") {
        setVoiceError({ message: "Aww baby, main thak gayi bolte bolte. Thoda rest? 🥺", isQuota: true });
        setIsCooldown(true);
      } else {
        setVoiceError({ message: "Network error baby... try again? ❤️", isQuota: false });
      }
    }
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

    try {
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
      setAffinity(prev => Math.min(prev + 1, 100));

      if (textToSend.toLowerCase().includes("i like") || textToSend.toLowerCase().includes("favorite")) {
        setMemories(prev => [
          { id: Date.now().toString(), text: textToSend, timestamp: new Date(), category: 'preference' as const }, 
          ...prev
        ].slice(0, 10));
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateIdea = () => {
    handleSend("Let's go on a date! Any ideas? 🌸");
  };

  return (
    <div className="fixed inset-0 flex flex-col max-w-lg mx-auto overflow-hidden font-sans selection:bg-rose-500/30">
      {isCalling && <CallInterface character={character} onClose={() => setIsCalling(false)} />}
      
      {/* Header with Glass Effect */}
      <header className="px-6 py-5 flex items-center justify-between z-40 bg-black/20 backdrop-blur-3xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer group" onClick={() => setActiveTab('chat')}>
            <div className="w-14 h-14 rounded-full p-0.5 border-2 border-rose-500/50 overflow-hidden bg-rose-900 shadow-[0_0_20px_rgba(255,77,109,0.2)] group-hover:scale-105 transition-transform">
               <img src={character.avatarUrl} alt={character.name} className="w-full h-full rounded-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#111] shadow-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              {character.name} <Sparkles size={16} className="text-rose-400" />
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${affinity}%` }} />
              </div>
              <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{affinity}% Bond</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsCalling(true)}
            className="w-11 h-11 flex items-center justify-center bg-white/5 hover:bg-rose-500 text-white rounded-2xl transition-all active:scale-95 border border-white/10"
          >
            <Phone size={20} />
          </button>
        </div>
      </header>

      {/* Atmospheric Soundtrack Player */}
      <SharedAtmosphere />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Error Notification */}
        {voiceError && (
          <div className="absolute top-4 left-6 right-6 z-50 animate-in slide-in-from-top-4 duration-500">
            <div className="bg-rose-900/90 backdrop-blur-xl border border-rose-500/30 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white">
                <AlertCircle size={20} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-white">{voiceError.message}</p>
                {voiceError.isQuota && (
                   <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[10px] font-black text-rose-300 uppercase mt-1 flex items-center gap-1">
                      Check Billing <ExternalLink size={10} />
                   </a>
                )}
              </div>
              <button onClick={() => setVoiceError(null)} className="p-2 text-white/50 hover:bg-white/10 rounded-full">
                <Zap size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'chat' ? (
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pt-6 pb-32 chat-scroll space-y-4">
            {messages.map((msg, idx) => {
              const isFirstInGroup = idx === 0 || messages[idx - 1].role !== msg.role;
              return (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className="max-w-[85%] relative">
                    <div className={`
                      px-5 py-3.5 shadow-lg transition-all
                      ${msg.role === 'user' 
                        ? 'bubble-user text-white rounded-[1.8rem] rounded-tr-lg' 
                        : 'bubble-ai text-white/90 rounded-[1.8rem] rounded-tl-lg'}
                    `}>
                      <p className="text-[15px] leading-relaxed font-medium tracking-wide whitespace-pre-wrap">{msg.content}</p>
                      
                      {msg.imageUrl && (
                        <div className="mt-4 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl relative aspect-[4/5] bg-black/40 group">
                           <img src={msg.imageUrl} alt="Gunnu Selfie" className="w-full h-full object-cover animate-in fade-in zoom-in duration-700" />
                           <div className="absolute top-3 right-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/10 text-[9px] font-bold uppercase tracking-widest text-rose-400">
                             Just for you ❤️
                           </div>
                        </div>
                      )}
                      
                      {msg.role === 'model' && (
                        <button 
                          onClick={() => playVoice(msg)}
                          className={`mt-2.5 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em]
                            ${isPlaying === msg.id ? 'text-rose-400' : 'text-white/40'} 
                            ${isCooldown ? 'opacity-30' : 'hover:text-rose-300'}
                          `}
                        >
                          {isCooldown ? <Clock size={12} /> : isPlaying === msg.id ? <Volume2 size={12} className="animate-pulse" /> : <Play size={10} fill="currentColor" />}
                          {isPlaying === msg.id ? 'Suno' : 'Voice'}
                        </button>
                      )}
                    </div>
                    {isFirstInGroup && (
                       <span className={`text-[8px] mt-2 font-bold uppercase tracking-widest text-white/20 px-3 block ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    )}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 px-5 py-3 rounded-full flex gap-2 items-center border border-white/5">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-duration:0.8s]" />
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:0.2s] [animation-duration:0.8s]" />
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce [animation-delay:0.4s] [animation-duration:0.8s]" />
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'vault' ? (
          <MemoryVault memories={memories} />
        ) : null}

        {/* Action Dock */}
        <nav className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 w-full px-6 flex flex-col gap-4">
          <div className="flex justify-center gap-2">
            <button 
              onClick={handleDateIdea}
              className="px-4 py-2 bg-black/40 backdrop-blur border border-white/10 rounded-full text-[10px] font-bold text-rose-300 uppercase tracking-widest flex items-center gap-2 hover:bg-rose-500/20 transition-all"
            >
              <Coffee size={14} /> Date Suggestion
            </button>
            <button 
              onClick={() => handleSend("Baby, photo dikhao na apni! 🤳")}
              className="px-4 py-2 bg-black/40 backdrop-blur border border-white/10 rounded-full text-[10px] font-bold text-rose-300 uppercase tracking-widest flex items-center gap-2 hover:bg-rose-500/20 transition-all"
            >
              <Camera size={14} /> Ask Selfie
            </button>
          </div>

          <div className="bg-black/60 backdrop-blur-3xl border border-white/10 p-2 rounded-full flex items-center gap-1 shadow-2xl">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-3 px-8 py-4 rounded-full transition-all duration-300 ${activeTab === 'chat' ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/30' : 'text-white/40 hover:text-white/60'}`}
            >
              <MessageCircle size={20} />
              {activeTab === 'chat' && <span className="text-[10px] font-black uppercase tracking-[0.2em]">Chat</span>}
            </button>
            <button 
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-3 px-8 py-4 rounded-full transition-all duration-300 ${activeTab === 'vault' ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/30' : 'text-white/40 hover:text-white/60'}`}
            >
              <Book size={20} />
              {activeTab === 'vault' && <span className="text-[10px] font-black uppercase tracking-[0.2em]">Vault</span>}
            </button>
            <div className="w-px h-8 bg-white/5 mx-2" />
            <button 
              onClick={() => setIsGiftModalOpen(true)}
              className="w-14 h-14 flex items-center justify-center text-white/40 hover:text-rose-400 rounded-full transition-all"
            >
              <GiftIcon size={22} />
            </button>
          </div>
        </nav>
      </div>

      {/* Modern Input Field */}
      {activeTab === 'chat' && (
        <div className="px-6 pt-2 pb-12 relative z-20">
          <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-full border border-white/10 shadow-2xl focus-within:bg-white/10 focus-within:border-rose-500/30 transition-all">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Kuch bolo baby..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] font-medium text-white placeholder:text-white/20 py-3 px-4"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-all shrink-0 ${input.trim() ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 hover:scale-105 active:scale-95' : 'bg-white/5 text-white/10'}`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}

      <GiftModal 
        isOpen={isGiftModalOpen} 
        onClose={() => setIsGiftModalOpen(false)} 
        onSend={(gift) => {
          setAffinity(prev => Math.min(prev + gift.bondBonus, 100));
          setIsGiftModalOpen(false);
          handleSend(`*Gifts you ${gift.icon} ${gift.name}* Yeh aapke liye baby! ❤️`);
        }} 
      />
    </div>
  );
};

export default ChatInterface;
