
export type CharacterId = 'maya';

export type Mood = 'Happy' | 'Creative' | 'Thoughtful' | 'Romantic' | 'Tired' | 'Dreamy';

export interface Memory {
  id: string;
  text: string;
  timestamp: Date;
  category: 'preference' | 'moment' | 'fact';
}

export interface Character {
  id: CharacterId;
  name: string;
  age: number;
  role: string;
  personality: string;
  visualDescription: string;
  avatarUrl: string;
  greeting: string;
  interests: string[];
  bio: string;
  voiceName: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  imageUrl?: string;
  audioUrl?: string;
  timestamp: Date;
  isPending?: boolean;
}

export interface ChatState {
  character: Character;
  messages: Message[];
  isThinking: boolean;
  affinity: number;
  mood: Mood;
  status: string;
  memories: Memory[];
}

export type ViewState = 'chat' | 'call' | 'vault' | 'dates';

export interface Gift {
  id: string;
  name: string;
  icon: string;
  bondBonus: number;
  description: string;
}
