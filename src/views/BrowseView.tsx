import React from 'react';
import { Song } from '../types/music';
import { AlbumCard } from '../components/AlbumCard';
import { SongRow } from '../components/SongRow';
import { Sparkles, Trophy, Flame } from 'lucide-react';

interface BrowseViewProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onPlayAlbum: (songs: Song[]) => void;
  onToggleFavorite: (songId: string) => void;
  onAddToQueue: (song: Song) => void;
}

export const BrowseView: React.FC<BrowseViewProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onPlayAlbum,
  onToggleFavorite,
  onAddToQueue
}) => {
  const moods = [
    { title: 'Chill & Unwind', color: 'from-blue-600 to-indigo-900', img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80' },
    { title: 'Gym & Workout', color: 'from-red-600 to-orange-700', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80' },
    { title: 'Deep Focus & Study', color: 'from-emerald-600 to-teal-900', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80' },
    { title: 'Night Drive', color: 'from-purple-700 to-pink-900', img: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80' },
  ];

  return (
    <div className="pb-32 pt-14 px-4 max-w-xl mx-auto space-y-7 select-none text-left">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Browse
        </h1>
        <p className="text-xs text-[#8E8E93] mt-0.5">Explore featured releases and local master recordings</p>
      </div>

      {/* Featured Banners */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 scroll-smooth">
        <AlbumCard
          title="Daily Top 100: Global"
          subtitle="The most-played tracks on Apple Music today"
          coverUrl="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80"
          badge="Top Charts"
          isEditorial={true}
          onPlay={() => songs.length > 0 && onPlayAlbum(songs)}
        />
        <AlbumCard
          title="Spatial Audio with Dolby Atmos"
          subtitle="Sound that surrounds you on every device"
          coverUrl="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80"
          badge="Spatial Audio"
          isEditorial={true}
          onPlay={() => songs.length > 2 && onPlaySong(songs[2])}
        />
      </div>

      {/* Daily Top Songs Chart List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Top Songs</span>
          </h2>
          <span className="text-xs font-semibold text-[#FA233B] cursor-pointer">
            Top 100
          </span>
        </div>

        <div className="divide-y divide-white/5 bg-[#1C1C1E]/60 rounded-2xl border border-white/10 p-1">
          {songs.map((song, idx) => (
            <SongRow
              key={song.id}
              song={song}
              index={idx}
              isCurrent={currentSong?.id === song.id}
              isPlaying={isPlaying}
              onPlay={onPlaySong}
              onToggleFavorite={onToggleFavorite}
              onAddToQueue={onAddToQueue}
            />
          ))}
        </div>
      </div>

      {/* Moods and Activities */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#FA233B]" />
          <span>Moods & Activities</span>
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {moods.map((m, i) => (
            <div
              key={i}
              onClick={() => songs.length > 0 && onPlaySong(songs[i % songs.length])}
              className="relative h-28 rounded-2xl overflow-hidden cursor-pointer group shadow-md border border-white/10"
            >
              <img
                src={m.img}
                alt={m.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 flex items-end">
                <span className="text-sm font-bold text-white leading-tight">
                  {m.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
