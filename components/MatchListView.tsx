
import React, { useState, useEffect } from 'react';
import { Match, UserProfile, ChatMessage } from '../types';

interface MatchListViewProps {
  matches: Match[];
  onOpenChat: (match: Match) => void;
}

const MatchListView: React.FC<MatchListViewProps> = ({ matches, onOpenChat }) => {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    // Check for unread messages in local storage for each match
    const checkUnread = () => {
      const allChats = JSON.parse(localStorage.getItem('clark_global_messages') || '{}');
      const counts: Record<string, number> = {};
      
      matches.forEach(match => {
        const chatId = match.id.replace('match_', ''); // Get the shared chat ID
        const msgs = allChats[chatId] || [];
        // For simplicity, we just count the total messages as "unread" if the list has grown
        // In a real app, we'd track 'lastSeen' timestamps
        counts[match.id] = msgs.length;
      });
      setUnreadCounts(counts);

      // Simulate "People who liked you" (randomly between 3-12 for that 'real' feel)
      setLikesCount(Math.floor(Math.random() * 10) + 3);
    };

    checkUnread();
    const interval = setInterval(checkUnread, 3000);
    return () => clearInterval(interval);
  }, [matches]);

  return (
    <div className="p-4 space-y-8 animate-fadeIn bg-slate-900 min-h-full">
      {/* Top Section: Matches & Likes */}
      <section>
        <div className="flex justify-between items-end mb-4 px-2">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Activity</h3>
          <span className="text-[10px] text-pink-500 font-bold uppercase tracking-widest">New Likes: {likesCount}</span>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
          {/* Likes You Card */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-dashed border-pink-500/30 flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-pink-500/10 blur-xl"></div>
               <i className="fa-solid fa-heart text-pink-500 text-xl animate-pulse"></i>
               <div className="absolute bottom-0 inset-x-0 bg-pink-500 text-white text-[8px] font-black text-center py-0.5">
                 {likesCount} LIKES
               </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Discover</span>
          </div>

          {matches.map(match => (
            <button 
              key={match.id}
              onClick={() => onOpenChat(match)}
              className="flex-shrink-0 flex flex-col items-center gap-2 group relative"
            >
              <div className="w-16 h-16 rounded-2xl p-0.5 gradient-bg group-active:scale-95 transition-all shadow-lg shadow-pink-500/10">
                <img 
                  src={match.profile.photos[0]} 
                  className="w-full h-full rounded-[14px] object-cover border-2 border-slate-900"
                  alt={match.profile.name}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-200 uppercase tracking-tighter">{match.profile.name}</span>
              {/* Unread Indicator */}
              <div className="absolute top-0 right-0 w-4 h-4 bg-pink-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
              </div>
            </button>
          ))}

          {matches.length === 0 && (
            <div className="flex-1 flex items-center justify-center h-16 opacity-20 border-2 border-dashed border-slate-700 rounded-2xl italic text-xs">
              No matches yet...
            </div>
          )}
        </div>
      </section>

      {/* Conversations Section */}
      <section>
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Recent Messages</h3>
        <div className="space-y-3">
          {matches.map(match => {
             const allChats = JSON.parse(localStorage.getItem('clark_global_messages') || '{}');
             const chatId = [match.userId, 'me'].sort().join('_'); // This would need proper currentUserID logic
             const lastMsg = allChats[match.id.replace('match_', '')]?.slice(-1)[0];

             return (
              <button
                key={match.id}
                onClick={() => onOpenChat(match)}
                className="w-full flex items-center gap-4 p-4 rounded-[2rem] bg-slate-800/40 hover:bg-slate-800 transition-all border border-white/5 group"
              >
                <div className="relative">
                  <img 
                    src={match.profile.photos[0]} 
                    className="w-14 h-14 rounded-2xl object-cover shadow-xl group-hover:scale-105 transition-transform"
                    alt={match.profile.name}
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full"></div>
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="font-black text-white text-sm">{match.profile.name}</h4>
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Now</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 font-medium italic">
                    {lastMsg ? lastMsg.text : `Start a conversation with ${match.profile.name}...`}
                  </p>
                </div>
                
                {(!lastMsg) && (
                  <div className="w-2 h-2 rounded-full bg-pink-500 shadow-lg shadow-pink-500/50"></div>
                )}
              </button>
            );
          })}
          
          {matches.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
               <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-3xl">
                 💌
               </div>
               <div>
                 <p className="text-slate-300 font-bold">Your inbox is quiet</p>
                 <p className="text-slate-500 text-xs mt-1">Go back to discovery to find new people!</p>
               </div>
            </div>
          )}
        </div>
      </section>
      
      <div className="pb-10 opacity-20 text-center">
        <span className="text-[8px] font-black uppercase tracking-[0.4em]">Clark Real-Time Protocol v2.4</span>
      </div>
    </div>
  );
};

export default MatchListView;
