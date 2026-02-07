
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  photos: string[];
  location: string;
  distance?: number;
  likedIds?: string[]; // IDs of people this user has liked
}

export interface MatchCompatibility {
  score: number;
  reason: string;
  commonVibe: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

export interface Match {
  id: string;
  userId: string;
  profile: UserProfile;
  lastMessage?: string;
}

export type AppView = 'onboarding' | 'discovery' | 'matches' | 'profile' | 'chat';
