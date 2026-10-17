import { Song, Playlist } from '../types/music';

export const INITIAL_SONGS: Song[] = [
  {
    id: 'demo-1',
    title: 'Starboy (Apple Lossless)',
    artist: 'The Weeknd ft. Daft Punk',
    album: 'Starboy',
    duration: 230,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80',
    genre: 'Pop / Synthwave',
    year: 2024,
    bitrate: 'Lossless 24-bit/48kHz ALAC',
    isFavorite: true,
    playCount: 42,
    isLocal: false,
    lyrics: [
      { time: 0, text: "♪ (Intro - Electric Synth Beat) ♪" },
      { time: 5, text: "I'm tryna put you in the worst mood, ah" },
      { time: 10, text: "P1 cleaner than your church shoes, ah" },
      { time: 15, text: "Milli point two just to hurt you, ah" },
      { time: 21, text: "All red Lamb' just to tease you, ah" },
      { time: 27, text: "None of these toys on lease too, ah" },
      { time: 33, text: "Made your whole year in a week too, yah" },
      { time: 38, text: "Main bitch out your league too, ah" },
      { time: 44, text: "Side bitch out of your out of your league too, ah" },
      { time: 50, text: "Look what you've done" },
      { time: 54, text: "I'm a motherfuckin' starboy" },
      { time: 60, text: "Look what you've done" },
      { time: 64, text: "I'm a motherfuckin' starboy" },
      { time: 70, text: "♪ (Guitar Solo & Synth Melodies) ♪" }
    ]
  },
  {
    id: 'demo-2',
    title: 'Midnight City (Dolby Atmos)',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    duration: 243,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    genre: 'Electronic',
    year: 2023,
    bitrate: 'Apple Digital Master • Dolby Atmos',
    isFavorite: true,
    playCount: 29,
    isLocal: false,
    lyrics: [
      { time: 0, text: "♪ (Atmospheric Synths) ♪" },
      { time: 8, text: "Waiting in a car, waiting for a ride in the dark" },
      { time: 16, text: "The night city grows, look and see her eyes, they glow" },
      { time: 24, text: "Waiting in a car, waiting for a ride in the dark" },
      { time: 32, text: "The night city grows, look and see her eyes, they glow" },
      { time: 40, text: "Waiting in a car, waiting for a ride in the dark" },
      { time: 48, text: "The city is my church, it wraps me in the blinding twilight" },
      { time: 56, text: "Waiting in a car, waiting for a ride in the dark" }
    ]
  },
  {
    id: 'demo-3',
    title: 'Blinding Lights (Spatial Audio)',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
    genre: 'Synthpop',
    year: 2023,
    bitrate: 'Spatial Audio • Hi-Res Lossless',
    isFavorite: false,
    playCount: 18,
    isLocal: false,
    lyrics: [
      { time: 0, text: "♪ (Fast 80s Synth intro) ♪" },
      { time: 6, text: "Yeah, yeah" },
      { time: 12, text: "I've been tryna call" },
      { time: 17, text: "I've been on my own for long enough" },
      { time: 23, text: "Maybe you can show me how to love, maybe" },
      { time: 29, text: "I'm going through withdrawals" },
      { time: 35, text: "You don't even have to do too much" },
      { time: 41, text: "You can turn me on with just a touch, baby" },
      { time: 48, text: "I look around and Sin City's cold and empty" },
      { time: 55, text: "No one's around to judge me" },
      { time: 60, text: "I can't see clearly when you're gone" },
      { time: 65, text: "I said, ooh, I'm blinded by the lights!" }
    ]
  },
  {
    id: 'demo-4',
    title: 'Levitating (Desi Masti Mix)',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    duration: 203,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    genre: 'Dance-Pop',
    year: 2024,
    bitrate: 'Lossless 24-bit/44.1kHz',
    isFavorite: true,
    playCount: 35,
    isLocal: false,
    lyrics: [
      { time: 0, text: "♪ (Bass Funk Rhythm) ♪" },
      { time: 5, text: "If you wanna run away with me, I know a galaxy" },
      { time: 11, text: "And I can take you for a ride" },
      { time: 16, text: "I had a premonition that we fell into a rhythm" },
      { time: 22, text: "Where the music don't stop for life" },
      { time: 28, text: "Glitter in the sky, glitter in my eyes" },
      { time: 33, text: "Shining just the way I like" },
      { time: 38, text: "If you're feeling like you need a little bit of company" },
      { time: 44, text: "You met me at the perfect time" },
      { time: 50, text: "You want me, I want you, baby" },
      { time: 55, text: "My sugarboo, I'm levitating!" }
    ]
  },
  {
    id: 'demo-5',
    title: 'Apna Bana Le (Acoustic Lo-Fi)',
    artist: 'Arijit Singh & Sachin-Jigar',
    album: 'Bhediya (Apple Master)',
    duration: 261,
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    genre: 'Bollywood / Soul',
    year: 2024,
    bitrate: 'Apple Digital Master',
    isFavorite: true,
    playCount: 50,
    isLocal: false,
    lyrics: [
      { time: 0, text: "♪ (Acoustic Guitar Strum) ♪" },
      { time: 6, text: "Tu mera koi na hoke bhi kuch laage" },
      { time: 14, text: "Tu mera koi na hoke bhi kuch laage" },
      { time: 22, text: "Kiya re jo bhi tune kaise kiya re" },
      { time: 30, text: "Jiya ko mere baandh aise liya re" },
      { time: 38, text: "Samajh ke bhi na samajh main sakoon" },
      { time: 46, text: "Apna bana le piya, apna bana le piya" },
      { time: 54, text: "Apna bana le mujhe, apna bana le piya!" }
    ]
  }
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-favorites',
    name: 'Favorite Songs',
    description: 'Tracks you loved with a heart or star in Masti Music',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    songIds: ['demo-1', 'demo-2', 'demo-4', 'demo-5'],
    createdAt: Date.now() - 86400000 * 10
  },
  {
    id: 'pl-heavy-rotation',
    name: 'Heavy Rotation',
    description: 'The music you have played the most on this device',
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=600&q=80',
    songIds: ['demo-5', 'demo-1', 'demo-4'],
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'pl-masti-party',
    name: 'Masti Chill & Vibes',
    description: 'Curated mix of synth, lo-fi, and desi beats',
    coverUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
    songIds: ['demo-1', 'demo-2', 'demo-3', 'demo-4', 'demo-5'],
    createdAt: Date.now() - 86400000 * 2
  }
];

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
    subtitle: 'The songs you know and love from 80s to 2000s',
    frequency: 'LIVE • On Air',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    badge: 'LIVE',
    color: 'from-amber-600 to-orange-700'
  },
  {
    id: 'radio-3',
    name: 'Masti Desi Beats',
    dj: 'DJ Shadow & Nucleya',
    subtitle: 'Pure energy, Bollywood anthems and Punjabi bass',
    frequency: 'STATION',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    badge: 'STATION',
    color: 'from-emerald-600 to-teal-800'
  },
  {
    id: 'radio-4',
    name: 'Chill & Lofi Radio',
    dj: 'Automated AI Flow',
    subtitle: 'Beats to study, relax and focus on Android',
    frequency: 'STATION',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    badge: 'STATION',
    color: 'from-purple-700 to-indigo-900'
  }
];

export const BROWSE_CATEGORIES = [
  { id: 'cat-pop', name: 'Pop', color: 'from-pink-500 to-rose-600', icon: '🎤' },
  { id: 'cat-hiphop', name: 'Hip-Hop', color: 'from-amber-500 to-red-600', icon: '🔥' },
  { id: 'cat-bollywood', name: 'Masti & Desi', color: 'from-orange-500 to-yellow-600', icon: '🪘' },
  { id: 'cat-dance', name: 'Dance & EDM', color: 'from-cyan-500 to-blue-600', icon: '⚡' },
  { id: 'cat-rock', name: 'Rock & Alt', color: 'from-red-600 to-purple-800', icon: '🎸' },
  { id: 'cat-rnb', name: 'R&B / Soul', color: 'from-purple-600 to-pink-600', icon: '✨' },
  { id: 'cat-chill', name: 'Chill & Acoustic', color: 'from-emerald-500 to-teal-700', icon: '🌿' },
  { id: 'cat-spatial', name: 'Spatial Audio', color: 'from-indigo-600 to-purple-900', icon: '🎧' }
];
