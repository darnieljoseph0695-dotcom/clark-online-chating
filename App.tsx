
import React, { useState, useEffect } from 'react';
import { UserProfile, AppView, Match } from './types';
import { MOCK_PROFILES, APP_NAME } from './constants';
import DiscoveryView from './components/DiscoveryView';
import OnboardingView from './components/OnboardingView';
import MatchListView from './components/MatchListView';
import ChatView from './components/ChatView';
import ProfileView from './components/ProfileView';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [communityProfiles, setCommunityProfiles] = useState<UserProfile[]>([]);
  const [currentView, setCurrentView] = useState<AppView>('onboarding');
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeChatMatch, setActiveChatMatch] = useState<Match | null>(null);

  // Initialize and load data from local storage
  useEffect(() => {
    const savedUser = localStorage.getItem('clark_user');
    const savedCommunity = localStorage.getItem('clark_community_pool_v2');

    // Build community pool from Mock data + locally created accounts
    let community = [...MOCK_PROFILES];
    if (savedCommunity) {
      const customOnes = JSON.parse(savedCommunity) as UserProfile[];
      const ids = new Set(community.map(p => p.id));
      customOnes.forEach(p => {
        if (!ids.has(p.id)) community = [p, ...community];
      });
    }
    setCommunityProfiles(community);

    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Update the current user from the community pool to get latest likes/data
      const updatedUser = community.find(p => p.id === parsedUser.id) || parsedUser;
      setCurrentUser(updatedUser);
      setCurrentView('discovery');
    }
  }, []);

  // Calculate matches based on mutual likes
  useEffect(() => {
    if (!currentUser) return;

    const myLikes = currentUser.likedIds || [];
    const newMatches: Match[] = [];

    communityProfiles.forEach(profile => {
      if (profile.id === currentUser.id) return;
      
      const theyLikedMe = (profile.likedIds || []).includes(currentUser.id);
      const ILikedThem = myLikes.includes(profile.id);

      if (theyLikedMe && ILikedThem) {
        newMatches.push({
          id: `match_${[currentUser.id, profile.id].sort().join('_')}`,
          userId: profile.id,
          profile: profile
        });
      }
    });

    setMatches(newMatches);
  }, [currentUser, communityProfiles]);

  const handleOnboardingComplete = (user: UserProfile) => {
    const newUser = { ...user, likedIds: [] };
    setCurrentUser(newUser);
    localStorage.setItem('clark_user', JSON.stringify(newUser));
    
    const savedCommunity = JSON.parse(localStorage.getItem('clark_community_pool_v2') || '[]');
    const updatedCommunity = [newUser, ...savedCommunity];
    localStorage.setItem('clark_community_pool_v2', JSON.stringify(updatedCommunity));
    
    setCommunityProfiles(prev => [newUser, ...prev]);
    setCurrentView('discovery');
  };

  const handleLike = (targetId: string) => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      likedIds: [...(currentUser.likedIds || []), targetId]
    };

    // Update community pool in state and storage
    const updatedCommunity = communityProfiles.map(p => p.id === currentUser.id ? updatedUser : p);
    
    setCurrentUser(updatedUser);
    setCommunityProfiles(updatedCommunity);
    
    localStorage.setItem('clark_user', JSON.stringify(updatedUser));
    const customOnes = updatedCommunity.filter(p => !MOCK_PROFILES.find(m => m.id === p.id));
    localStorage.setItem('clark_community_pool_v2', JSON.stringify(customOnes));
  };

  const openChat = (match: Match) => {
    setActiveChatMatch(match);
    setCurrentView('chat');
  };

  const logout = () => {
    localStorage.removeItem('clark_user');
    setCurrentUser(null);
    setCurrentView('onboarding');
    setMatches([]);
  };

  const renderView = () => {
    switch (currentView) {
      case 'onboarding':
        return <OnboardingView onComplete={handleOnboardingComplete} />;
      case 'discovery':
        const viewedIds = new Set(currentUser?.likedIds || []);
        const availableProfiles = communityProfiles.filter(p => 
          p.id !== currentUser?.id && !viewedIds.has(p.id)
        );
        return (
          <DiscoveryView 
            profiles={availableProfiles} 
            onLike={handleLike}
            currentUser={currentUser!}
            allProfiles={communityProfiles}
          />
        );
      case 'matches':
        return <MatchListView matches={matches} onOpenChat={openChat} />;
      case 'chat':
        return activeChatMatch ? (
          <ChatView 
            match={activeChatMatch} 
            currentUser={currentUser!}
            onBack={() => setCurrentView('matches')} 
          />
        ) : <MatchListView matches={matches} onOpenChat={openChat} />;
      case 'profile':
        return <ProfileView user={currentUser!} onLogout={logout} onUpdate={setCurrentUser} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto relative flex flex-col bg-slate-900 shadow-2xl overflow-hidden border-x border-slate-800">
      {currentView !== 'onboarding' && (
        <header className="px-6 py-4 flex justify-between items-center glass z-50">
          <h1 className="text-2xl font-black tracking-tighter cursor-pointer" onClick={() => setCurrentView('discovery')}>
            <span className="gradient-text italic">Clark.</span>
          </h1>
          <div className="flex gap-6">
            <button 
              onClick={() => setCurrentView('discovery')}
              className={`text-xl transition-all ${currentView === 'discovery' ? 'text-pink-500 scale-125' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <i className="fa-solid fa-fire"></i>
            </button>
            <button 
              onClick={() => setCurrentView('matches')}
              className={`text-xl transition-all ${currentView === 'matches' || currentView === 'chat' ? 'text-pink-500 scale-125' : 'text-slate-400 hover:text-slate-200'} relative`}
            >
              <i className="fa-solid fa-heart"></i>
              {matches.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-pulse shadow-lg shadow-pink-500/50">
                  {matches.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setCurrentView('profile')}
              className={`text-xl transition-all ${currentView === 'profile' ? 'text-pink-500 scale-125' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <i className="fa-solid fa-user-gear"></i>
            </button>
          </div>
        </header>
      )}

      <main className="flex-1 overflow-y-auto relative bg-slate-900">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
