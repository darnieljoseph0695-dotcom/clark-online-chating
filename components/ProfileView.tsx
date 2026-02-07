
import React from 'react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdate: (user: UserProfile) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout }) => {
  return (
    <div className="p-6 space-y-8 animate-fadeIn pb-24 bg-slate-900 min-h-full">
      <div className="flex flex-col items-center">
        <div className="relative group">
           <img 
            src={user.photos[0]} 
            className="w-44 h-44 rounded-[2.5rem] object-cover border-4 border-slate-800 shadow-[0_20px_50px_rgba(244,114,182,0.15)] transition-all group-hover:scale-105"
            alt={user.name}
          />
          <div className="absolute -bottom-2 -right-2 w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center text-white border-[6px] border-slate-900 shadow-xl cursor-pointer hover:rotate-6 transition-all">
            <i className="fa-solid fa-pen-nib text-lg"></i>
          </div>
        </div>
        <h2 className="mt-6 text-4xl font-black italic tracking-tighter">{user.name}, {user.age}</h2>
        <div className="flex items-center gap-2 text-slate-500 mt-2">
          <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em]">{user.location}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'SENT', val: '412' },
          { label: 'VIEWED', val: '1.8k' },
          { label: 'MATCH %', val: '92' }
        ].map(item => (
          <div key={item.label} className="flex flex-col items-center p-5 glass rounded-[2rem] border-white/5">
             <span className="text-2xl font-black text-white italic">{item.val}</span>
             <span className="text-[8px] text-slate-500 font-black tracking-[0.3em] mt-1">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="glass p-6 rounded-[2.5rem] space-y-4 border-white/5 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-3xl rounded-full"></div>
           <div className="flex justify-between items-center relative">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Story</h3>
             <i className="fa-solid fa-quote-right text-slate-700"></i>
           </div>
           <p className="text-slate-200 text-sm leading-relaxed font-bold italic relative">
             "{user.bio}"
           </p>
        </div>

        <div className="glass p-6 rounded-[2.5rem] space-y-4 border-white/5">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Interest Signature</h3>
           <div className="flex flex-wrap gap-2.5">
              {user.interests.map(interest => (
                <span key={interest} className="px-5 py-2.5 bg-slate-800/60 rounded-xl text-[10px] font-black text-pink-400 border border-pink-500/10 shadow-sm uppercase tracking-widest">
                  #{interest}
                </span>
              ))}
           </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="p-1 glass rounded-[2rem]">
          <button 
            onClick={onLogout}
            className="w-full p-6 bg-slate-800/50 rounded-[1.8rem] flex items-center gap-5 text-slate-200 hover:bg-slate-800 transition-all group"
          >
             <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition shadow-inner">
               <i className="fa-solid fa-user-plus text-lg"></i>
             </div>
             <div className="text-left">
                <span className="font-black block text-sm uppercase tracking-widest">Switch Profile</span>
                <span className="text-[10px] text-slate-500 font-bold">Swap to another account to chat</span>
             </div>
             <i className="fa-solid fa-chevron-right ml-auto text-slate-700"></i>
          </button>
        </div>

        <button 
          onClick={onLogout}
          className="w-full p-5 flex items-center justify-center gap-3 text-red-500/50 hover:text-red-500 transition-all font-black text-[10px] uppercase tracking-[0.4em]"
        >
           <i className="fa-solid fa-power-off"></i>
           Deactivate Session
        </button>
      </div>

      <div className="text-center py-10">
        <div className="flex justify-center gap-4 opacity-20 mb-4">
          <i className="fa-brands fa-instagram"></i>
          <i className="fa-brands fa-twitter"></i>
          <i className="fa-brands fa-tiktok"></i>
        </div>
        <p className="text-[8px] text-slate-600 uppercase tracking-[0.6em] font-black">Clark Online Dating System • Los Angeles</p>
      </div>
    </div>
  );
};

export default ProfileView;
