
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Character } from '../types';
import { X, Mic, MicOff, PhoneOff } from 'lucide-react';

interface Props {
  character: Character;
  onClose: () => void;
}

// Manual implementation of decode following guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Manual implementation of encode following guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Decoding function for raw PCM as per guidelines
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const CallInterface: React.FC<Props> = ({ character, onClose }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState('Connecting...');
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isMutedRef = useRef(isMuted);

  // Keep ref in sync with state to avoid stale closure in onaudioprocess
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    // Correctly initialize with process.env.API_KEY directly
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let session: any = null;

    const setupLive = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Use proper AudioContext fallback
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          callbacks: {
            onopen: () => {
              setStatus('Connected');
              const source = inputCtx.createMediaStreamSource(stream);
              const processor = inputCtx.createScriptProcessor(4096, 1, 1);
              processor.onaudioprocess = (e) => {
                // Use ref to check muted state without re-connecting session
                if (isMutedRef.current) return;
                const inputData = e.inputBuffer.getChannelData(0);
                const int16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
                
                // Use manual encode
                const base64 = encode(new Uint8Array(int16.buffer));
                sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
              };
              source.connect(processor);
              processor.connect(inputCtx.destination);
            },
            onmessage: async (msg) => {
              const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (audioData && audioContextRef.current) {
                // Use manual decode and helper function
                const bytes = decode(audioData);
                const buffer = await decodeAudioData(bytes, audioContextRef.current, 24000, 1);

                const source = audioContextRef.current.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContextRef.current.destination);
                const startTime = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
                source.start(startTime);
                nextStartTimeRef.current = startTime + buffer.duration;
                sourcesRef.current.add(source);
                source.onended = () => sourcesRef.current.delete(source);
              }
              if (msg.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
              }
            },
            onerror: () => setStatus('Error'),
            onclose: () => setStatus('Disconnected'),
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: character.voiceName } } },
            systemInstruction: `You are ${character.name}. You are on a voice call with your partner. Speak naturally in Hinglish. Keep it warm and loving.`,
          }
        });
        session = await sessionPromise;
      } catch (e) {
        console.error(e);
        setStatus('Failed to connect');
      }
    };

    setupLive();
    return () => {
      if (session) session.close();
      sourcesRef.current.forEach(s => {
        try { s.stop(); } catch (e) {}
      });
    };
  }, [character]); // Removed isMuted from deps to prevent re-connections

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-between py-20 animate-in fade-in zoom-in duration-300">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-rose-500 rounded-full blur-2xl opacity-20 animate-pulse" />
          <img src={character.avatarUrl} className="w-40 h-40 rounded-full object-cover border-4 border-rose-500/30 relative z-10" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-rose-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-white shadow-lg">
            {status}
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mt-4">{character.name}</h2>
        <p className="text-rose-400 font-medium">Listening to your heart...</p>
      </div>

      <div className="w-full max-w-xs flex flex-col gap-10">
        <div className="flex justify-center gap-2 items-end h-12">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-1.5 bg-rose-500/40 rounded-full animate-bounce" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>

        <div className="flex items-center justify-around">
          <button onClick={() => setIsMuted(!isMuted)} className={`p-5 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
          </button>
          <button onClick={onClose} className="p-6 rounded-full bg-rose-600 text-white hover:bg-rose-500 shadow-xl shadow-rose-600/30 hover:scale-110 transition-all">
            <PhoneOff size={32} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallInterface;