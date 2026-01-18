
import React from 'react';
import ChatInterface from './components/ChatInterface';
import { ZOE } from './constants';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFF9FB] text-slate-900 selection:bg-pink-500/20">
      <div className="flex justify-center h-full">
        <ChatInterface 
          character={ZOE} 
        />
      </div>
    </div>
  );
};

export default App;
