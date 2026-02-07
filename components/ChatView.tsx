
import React, { useState, useRef, useEffect } from 'react';
import { Match, ChatMessage, UserProfile } from '../types';
import { generateIcebreaker } from '../services/geminiService';

interface ChatViewProps {
  match: Match;
  currentUser: UserProfile;
  onBack: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ match, currentUser, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGeneratingIcebreaker, setIsGeneratingIcebreaker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Shared Chat ID: unique pair between two IDs, regardless of who is 'currentUser'
  const chatId = [currentUser.id, match.userId].sort().join('_');

  useEffect(() => {
    const loadMsgs = () => {
      const allChats = JSON.parse(localStorage.getItem('clark_global_messages') || '{}');
      if (allChats[chatId]) {
        const loadedMsgs = allChats[chatId].map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        
        // Only update state if message count changed to prevent jitter
        setMessages(prev => {
          if (prev.length !== loadedMsgs.length) return loadedMsgs;
          return prev;
        });
      }
    };

    loadMsgs();
    // HEARTBEAT POLL: Every 2 seconds to check if the 'other' person sent something
    const interval = setInterval(loadMsgs, 2000);
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const msgText = inputText.trim();
    if (!msgText) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      senderId: currentUser.id,
      text: msgText,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputText('');

    // Save to global local database
    const allChats = JSON.parse(localStorage.getItem('clark_global_messages') || '{}');
    allChats[chatId] = updatedMessages;
    localStorage.setItem('clark_global_messages', JSON.stringify(allChats));
  };

  const handleMagicIcebreaker = async () => {
    setIsGeneratingIcebreaker(true);
    try {
      const icebreaker = await generateIcebreaker(currentUser, match.profile);
      setInputText(icebreaker);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingIcebreaker(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-slideInRight bg-slate-900">
      {/* Header */}
      <div className="p-4 flex items-center gap-4 glass z-20 sticky top-0 border-b border-white/5">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition p-2">
          <i className="fa-solid fa-arrow-left text-lg"></i>
        </button>
        <div className="flex items-center gap-3">
           <div className="relative">
             <img 
               src={match.profile.photos[0]} 
               className="w-11 h-11 rounded-2xl object-cover shadow-lg ring-2 ring-slate-800"
               alt={match.profile.name}
             />
             <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-[3px] border-slate-900 rounded-full"></div>
           </div>
           <div className="flex flex-col">
             <h4 className="font-black text-white text-sm leading-none">{match.profile.name}</h4>
             <span className="text-[9px] text-green-400 font-black uppercase tracking-[0.2em] mt-1.5">Online Now</span>
           </div>
        </div>
        <div className="ml-auto flex gap-5 text-slate-500">
           <i className="fa-solid fa-phone hover:text-pink-400 cursor-pointer transition"></i>
           <i className="fa-solid fa-video hover:text-pink-400 cursor-pointer transition"></i>
        </div>
      </div>

      {/* Message Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-900/60 custom-scrollbar"
      >
        <div className="text-center py-6 flex flex-col items-center gap-3">
           <div className="h-[1px] w-20 bg-slate-800"></div>
           <span className="text-[8px] uppercase font-black text-slate-500 tracking-[0.5em]">Encryption Active</span>
        </div>

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 space-y-6">
             <div className="flex -space-x-4">
                <div className="w-16 h-16 rounded-full border-4 border-slate-900 overflow-hidden shadow-2xl">
                  <img src={currentUser.photos[0]} className="w-full h-full object-cover" alt="You" />
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-slate-900 overflow-hidden shadow-2xl">
                  <img src={match.profile.photos[0]} className="w-full h-full object-cover" alt="Match" />
                </div>
             </div>
             <div className="text-center px-10">
                <p className="text-white font-black text-xl italic">It's a Real Match!</p>
                <p className="text-slate-400 text-[11px] font-medium leading-relaxed mt-2 uppercase tracking-widest">
                  This is a direct channel to {match.profile.name}. Send the first vibe.
                </p>
             </div>
          </div>
        )}

        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            <div 
              className={`max-w-[80%] p-4 rounded-3xl text-sm shadow-xl leading-relaxed font-medium ${
                msg.senderId === currentUser.id 
                ? 'bg-pink-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
              }`}
            >
              {msg.text}
              <div className="flex justify-end items-center gap-1.5 mt-2 opacity-40">
                <span className="text-[8px] font-black uppercase">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.senderId === currentUser.id && <i className="fa-solid fa-check-double text-[8px]"></i>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Input Area */}
      <div className="p-4 glass pb-8 sticky bottom-0">
        {!inputText && (
          <button 
            onClick={handleMagicIcebreaker}
            disabled={isGeneratingIcebreaker}
            className="w-full mb-4 py-3.5 px-4 rounded-2xl border border-pink-500/20 bg-pink-500/5 text-pink-400 text-[9px] font-black uppercase tracking-[0.3em] hover:bg-pink-500/10 transition-all flex items-center justify-center gap-3 shadow-inner"
          >
            {isGeneratingIcebreaker ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
            {isGeneratingIcebreaker ? 'Summoning AI...' : 'Use AI Icebreaker Assistant'}
          </button>
        )}

        <div className="flex items-center gap-3 bg-slate-800/80 rounded-[2rem] p-2 shadow-2xl border border-white/5">
          <button className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-pink-400 transition">
            <i className="fa-solid fa-camera text-lg"></i>
          </button>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none outline-none text-white text-sm py-2 font-medium"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-12 h-12 flex items-center justify-center gradient-bg rounded-full text-white shadow-lg transition-all active:scale-90 disabled:opacity-20 disabled:grayscale"
          >
            <i className="fa-solid fa-arrow-up text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
