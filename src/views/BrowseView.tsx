import React from 'react';
import { Song } from '../types/music';
import { BROWSE_CATEGORIES } from '../services/mockData';
import { SongRow } from '../components/SongRow';
import { Flame, FolderDown } from 'lucide-react';

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
  onToggleFavorite,
  onAddToQueue
}) => {
  return (
    <div className="pb-32 pt-14 px-4 max-w-xl mx-auto space-y-7 select-none text-left animate-view">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Browse
        </h1>
        <p className="text-xs text-[#8E8E93] mt-0.5">Explore categories and lossless local music</p>
      </div>

      {/* Moods & Categories */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#FA233B]" />
          <span>Music Categories</span>
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {BROWSE_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className={`relative h-28 rounded-2xl p-3.5 flex flex-col justify-between overflow-hidden cursor-pointer shadow-md bg-gradient-to-br ${cat.color} group transition-all duration-300 hover:scale-[1.02] active:scale-95`}
            >
              <span className="text-base font-black text-white tracking-tight drop-shadow-sm">
                {cat.name}
              </span>

              <span className="text-3xl self-end drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                {cat.icon}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scanned Local Tracks list if any */}
      {songs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-white">
            All Local Audio
          </h2>

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
      )}
    </div>
  );
};
