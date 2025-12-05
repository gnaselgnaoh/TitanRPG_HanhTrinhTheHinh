import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { consultOracle } from '../services/geminiService';
import { MessageSquare, Send, Sparkles } from 'lucide-react';

interface OracleChatProps {
  profile: UserProfile;
}

const OracleChat: React.FC<OracleChatProps> = ({ profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'oracle', text: string}[]>([
    { role: 'oracle', text: `Chào ${profile.name}. Ngươi cần lời khuyên gì về hành trình rèn luyện hôm nay?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    const reply = await consultOracle(userMsg, profile);
    
    setMessages(prev => [...prev, { role: 'oracle', text: reply }]);
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 rounded-full shadow-lg border-2 border-purple-400 flex items-center justify-center hover:bg-purple-500 hover:scale-105 transition-all z-50 group"
      >
        <Sparkles className="text-white group-hover:animate-spin" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-rpg-panel border border-purple-500/50 rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden h-[500px]">
      {/* Header */}
      <div className="bg-purple-900/50 p-3 flex justify-between items-center border-b border-purple-500/30">
        <h3 className="font-rpg text-purple-200 flex items-center gap-2">
          <Sparkles size={16} /> Oracle AI
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/80" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
              m.role === 'user' 
                ? 'bg-purple-600 text-white rounded-br-none' 
                : 'bg-slate-700 text-slate-200 rounded-bl-none border border-slate-600'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-slate-700 px-4 py-2 rounded-full text-xs text-slate-400 animate-pulse">
               Oracle đang suy ngẫm...
             </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-rpg-panel border-t border-slate-700 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Hỏi về bài tập, dinh dưỡng..."
          className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
        />
        <button 
          onClick={handleSend}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-500 text-white p-2 rounded disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default OracleChat;
