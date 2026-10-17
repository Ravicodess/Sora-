import { Song, Playlist } from '../types/music';

// Zero dummy data: Clean slate for user's local music files
export const INITIAL_SONGS: Song[] = [];

export const INITIAL_PLAYLISTS: Playlist[] = [];

export const RADIO_STATIONS = [
  {
    id: 'radio-1',
    name: 'Apple Music 1',
    dj: 'Zane Lowe',
    subtitle: 'The new music that matters now',
    frequency: 'LIVE • 24/7',
    coverUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80',
    badge: 'LIVE',
    color: 'from-red-600 to-pink-700'
  },
  {
    id: 'radio-2',
    name: 'Apple Music Hits',
    dj: 'Estelle & Jayde Donovan',
    subtitle: 'The songs you know and love',
    frequency: 'LIVE • On Air',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    badge: 'LIVE',
    color: 'from-amber-600 to-orange-700'
  },
  {
    id: 'radio-3',
    name: 'Sora Chill & Lo-Fi',
    dj: 'Algorithmic Flow',
    subtitle: 'Immersive soundscapes for focus & rest',
    frequency: 'STATION',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    badge: 'STATION',
    color: 'from-purple-700 to-indigo-900'
  }
];

export const BROWSE_CATEGORIES = [
  { id: 'cat-pop', name: 'Pop', color: 'from-pink-500 to-rose-600', icon: '🎤' },
  { id: 'cat-hiphop', name: 'Hip-Hop', color: 'from-amber-500 to-red-600', icon: '🔥' },
  { id: 'cat-electronic', name: 'Electronic & Dance', color: 'from-cyan-500 to-blue-600', icon: '⚡' },
  { id: 'cat-rock', name: 'Rock & Alternative', color: 'from-red-600 to-purple-800', icon: '🎸' },
  { id: 'cat-rnb', name: 'R&B / Soul', color: 'from-purple-600 to-pink-600', icon: '✨' },
  { id: 'cat-chill', name: 'Chill & Acoustic', color: 'from-emerald-500 to-teal-700', icon: '🌿' },
  { id: 'cat-spatial', name: 'Spatial Audio', color: 'from-indigo-600 to-purple-900', icon: '🎧' },
  { id: 'cat-classical', name: 'Classical & Ambient', color: 'from-blue-600 to-slate-800', icon: '🎻' }
];
