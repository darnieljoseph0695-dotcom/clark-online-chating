
import React, { useState, useEffect } from 'react';
import { UserProfile, MatchCompatibility } from '../types';
import { analyzeCompatibility } from '../services/geminiService';

interface DiscoveryViewProps {
  profiles: UserProfile[];
  onLike: (targetId: string) => void;
  currentUser: UserProfile;
  allProfiles: UserProfile[];
}

const DiscoveryView: React.FC<DiscoveryViewProps> = ({ profiles, onLike, currentUser, allProfiles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [analysis, setAnalysis] = useState<MatchCompatibility | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);

  const currentProfile = profiles[currentIndex];

  useEffect(() => {
    if (currentProfile) {
      const getAnalysis = async () => {
        setIsAnalyzing(true);
        setAnalysis(null);
        try {
          const res = await analyzeCompatibility(currentUser, currentProfile);
          setAnalysis(res);
        } catch (err) {
          console.error(err);
        } finally {
          setIsAnalyzing(false);
        }
      };
      getAnalysis();
    }
  }, [currentProfile, currentUser]);

  const handleLike = () => {
    // Check if it's a mutual match
    const theyLikedMe = (currentProfile.likedIds || []).includes(currentUser.id);
    
    onLike(currentProfile.id);

    if (theyLikedMe) {
      setShowMatchAnimation(true);
      setTimeout(() => {
        setShowMatchAnimation(false);
        setCurrentIndex(prev => prev + 1);
      }, 2500);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePass = () => {
    setCurrentIndex(prev => prev + 1);
  };

  // Helper to check if a profile is a mock or a real user
  const isRealUser = (id: string) => id.startsWith('user_');

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-4xl mb-4 animate-bounce">
          👋
        </div>
        <h2 className="text-xl font-bold text-white">No one new!</h2>
        <p className="text-slate-400">You've seen everyone in your area. Try creating a new account to see yourself!</p>
        <button 
           onClick={() => setCurrentIndex(0)}
           className="px-8 py-3 rounded-full gradient-bg text-white font-bold shadow-xl hover:scale-105 transition"
        >
          Refresh Feed
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 relative h-full flex flex-col animate-fadeIn">
      {/* Profile Card */}
      <div className="relative group flex-1">
        <div className="w-full h-[58vh] rounded-3xl overflow-hidden relative shadow-2xl transition-all duration-500">
          <img 
            src={currentProfile.photos[0]} 
            alt={currentProfile.name}
            className="w-full h-full object-cover"
          />
          
          {isRealUser(currentProfile.id) && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-green-500/90 text-white text-[10px] font-black rounded-full flex items-center gap-1 shadow-lg backdrop-blur-sm uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              Real Member
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/60 to-transparent">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {currentProfile.name}, {currentProfile.age}
                </h2>
                <p className="text-slate-300 text-xs flex items-center gap-1 opacity-80">
                  <i className="fa-solid fa-location-dot"></i> {currentProfile.location} • {currentProfile.distance} miles away
                </p>
              </div>
            </div>
            
            <p className="mt-3 text-slate-100 text-sm italic line-clamp-2">
              "{currentProfile.bio}"
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {currentProfile.interests.slice(0, 3).map(interest => (
                <span key={interest} className="px-2 py-1 rounded-md glass text-[10px] font-bold text-pink-300 uppercase tracking-widest">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insight Overlay */}
        <div className="mt-4 glass p-4 rounded-2xl border-pink-500/20 shadow-lg relative overflow-hidden">
          {!isAnalyzing && analysis && (
            <div 
              className="absolute bottom-0 left-0 h-1 gradient-bg opacity-30 transition-all duration-1000" 
              style={{ width: `${analysis.score}%` }}
            />
          )}

          <div className="flex items-center gap-2 mb-2">
             <i className="fa-solid fa-sparkles text-pink-400 animate-pulse"></i>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-400">Compatibility AI</span>
          </div>
          
          {isAnalyzing ? (
            <div className="flex items-center gap-3 py-2">
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                 <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
               </div>
               <span className="text-xs font-medium text-slate-400">Deep Learning Match...</span>
            </div>
          ) : analysis ? (
            <div className="space-y-1 animate-fadeIn">
               <div className="flex justify-between items-center">
                 <span className="text-base font-bold text-white tracking-tight">{analysis.commonVibe}</span>
                 <span className="text-2xl font-black gradient-text">{analysis.score}%</span>
               </div>
               <p className="text-xs text-slate-400 leading-tight">
                 {analysis.reason}
               </p>
            </div>
          ) : (
            <span className="text-xs text-slate-500 uppercase tracking-widest">Calculating Vibe...</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-6 mt-6 pb-4">
        <button 
          onClick={handlePass}
          className="w-14 h-14 rounded-full glass flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-110 active:scale-90 shadow-lg"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
        <button 
          onClick={handleLike}
          className="w-18 h-18 rounded-full gradient-bg flex items-center justify-center text-white transition-all hover:scale-110 active:scale-90 shadow-pink-500/30 shadow-2xl"
        >
          <i className="fa-solid fa-heart text-2xl"></i>
        </button>
        <button 
          className="w-14 h-14 rounded-full glass flex items-center justify-center text-pink-400 hover:text-pink-300 transition-all hover:scale-110 active:scale-90 shadow-lg"
        >
          <i className="fa-solid fa-bolt text-xl"></i>
        </button>
      </div>

      {/* Match Animation Overlay */}
      {showMatchAnimation && (
        <div className="absolute inset-0 z-[100] bg-slate-900/95 flex flex-col items-center justify-center animate-fadeIn p-8 text-center">
          <div className="flex gap-4 mb-8">
             <img src={currentUser.photos[0]} className="w-24 h-24 rounded-full border-4 border-pink-500 shadow-2xl animate-bounce" alt="You" />
             <img src={currentProfile.photos[0]} className="w-24 h-24 rounded-full border-4 border-pink-500 shadow-2xl animate-bounce [animation-delay:0.2s]" alt="Match" />
          </div>
          <h2 className="text-5xl font-black text-white italic tracking-tighter mb-2">BOOM!</h2>
          <p className="text-pink-400 font-bold uppercase tracking-widest text-sm mb-6">A Mutual Match!</p>
          <p className="text-slate-400 text-sm max-w-xs mb-8">
            You and {currentProfile.name} both swiped right. Time to say hello!
          </p>
          <div className="w-16 h-1 bg-pink-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default DiscoveryView;
