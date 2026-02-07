
import { UserProfile } from './types';

export const MOCK_PROFILES: UserProfile[] = [
  {
    id: '1',
    name: 'Elena',
    age: 26,
    bio: 'Software engineer by day, urban explorer by night. Looking for someone who can debate tabs vs spaces and then go for tacos.',
    interests: ['Coding', 'Tacos', 'Photography', 'Hiking'],
    photos: ['https://picsum.photos/seed/elena/600/800'],
    location: 'San Francisco, CA',
    distance: 2.4
  },
  {
    id: '2',
    name: 'Marcus',
    age: 29,
    bio: 'Avid record collector and amateur chef. I make a mean mushroom risotto. Let’s trade music recommendations!',
    interests: ['Vinyl', 'Cooking', 'Jazz', 'Architecture'],
    photos: ['https://picsum.photos/seed/marcus/600/800'],
    location: 'Brooklyn, NY',
    distance: 5.1
  },
  {
    id: '3',
    name: 'Sophia',
    age: 24,
    bio: 'Loves golden retrievers and rainy Sundays. Currently learning to play the cello. Life is too short for boring coffee.',
    interests: ['Dogs', 'Cello', 'Coffee', 'Poetry'],
    photos: ['https://picsum.photos/seed/sophia/600/800'],
    location: 'Austin, TX',
    distance: 3.7
  },
  {
    id: '4',
    name: 'Julian',
    age: 31,
    bio: 'Gym rat with a secret passion for interior design. If you need someone to help you move furniture or bench press it, I’m your guy.',
    interests: ['Fitness', 'Design', 'Travel', 'Sci-Fi'],
    photos: ['https://picsum.photos/seed/julian/600/800'],
    location: 'Chicago, IL',
    distance: 12.0
  }
];

export const APP_NAME = "Clark";
