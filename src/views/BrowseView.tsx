import React, { useState } from 'react';
import { Song } from '../types/music';
import { BROWSE_CATEGORIES } from '../services/mockData';
import { SongRow } from '../components/SongRow';
import { Flame, FolderPlus, Play, X, Music } from 'lucide-react';

interface BrowseViewProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onPlayAlbum: (songs: Song[]) => void;
  onToggleFavorite: (songId: string) => void;
  onAddToQueue: (song: Song) => void;
  onOpenImport?: () => void;
  showToast?: (message: string) => void;
}

export const BrowseView: React.FC<BrowseViewProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onPlayAlbum,
  onToggleFavorite,
  onAddToQueue,
  onOpenImport,
  showToast
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryName: string) => {
    if (songs.length === 0) {
      showToast?.(`Scan local music to explore ${categoryName}`);
      onOpenImport?.();
      return;
    }

    if (selectedCategory === categoryName) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryName);
      showToast?.(`Filtered by ${categoryName}`);
    }
  };

  const filteredSongs = selectedCategory
    ? songs.filter((s) => {
        const cat = selectedCategory.toLowerCase();
        return (
          (s.genre && s.genre.toLowerCase().includes(cat)) ||
          s.title.toLowerCase().includes(cat) ||
          s.album.toLowerCase().includes(cat) ||
          s.artist.toLowerCase().includes(cat)
        );
      })
    : songs;

  return (
    <div className="pb-32 pt-14 px-4 max-w-xl mx-auto space-y-7 select-none text-left animate-view">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Browse
          </h1>
          <p className="text-xs text-[#8E8E93] mt-0.5">Explore categories and lossless local music</p>
        </div>

        {songs.length === 0 && (
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/12 text-xs font-semibold text-white active:scale-95 transition-all duration-200"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#FA233B]" />
            <span>Scan Music</span>
          </button>
        )}
      </div>

      {/* Moods & Categories */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#FA233B]" />
          <span>Music Categories</span>
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {BROWSE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <div
                key={cat.id}
                role="button"
                tabIndex={0}
                onClick={() => handleCategoryClick(cat.name)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCategoryClick(cat.name);
                  }
                }}
                className={`relative h-28 rounded-2xl p-3.5 flex flex-col justify-between overflow-hidden cursor-pointer shadow-md bg-gradient-to-br ${cat.color} group transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
                  isSelected ? 'ring-2 ring-white shadow-xl scale-[1.02]' : 'opacity-90 hover:opacity-100'
                }`}
                aria-label={`Filter by category ${cat.name}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-white tracking-tight drop-shadow-sm">
                    {cat.name}
                  </span>
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-bold text-white uppercase backdrop-blur-sm">
                      Active
                    </span>
                  )}
                </div>

                <span className="text-3xl self-end drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                  {cat.icon}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Filter Active Indicator */}
      {selectedCategory && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1C1C1E] border border-white/10 animate-fade-in">
          <div>
            <span className="text-xs text-[#8E8E93]">Showing tracks matching:</span>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-[#FA233B]">{selectedCategory}</span>
              <span className="text-xs text-[#8E8E93]">({filteredSongs.length} songs)</span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {filteredSongs.length > 0 && (
              <button
                onClick={() => onPlayAlbum(filteredSongs)}
                className="px-3 py-1.5 rounded-full bg-[#FA233B] hover:bg-[#ff3b50] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-apple-glow"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Play All</span>
              </button>
            )}
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-1.5 rounded-full bg-white/10 text-white/80 hover:text-white"
              aria-label="Clear Category Filter"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Scanned Local Tracks list if any */}
      {songs.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white">
              {selectedCategory ? `${selectedCategory} Tracks` : 'All Local Audio'}
            </h2>
            {filteredSongs.length > 0 && (
              <button
                onClick={() => onPlayAlbum(filteredSongs)}
                className="text-xs font-bold text-[#FA233B] hover:underline flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Play All</span>
              </button>
            )}
          </div>

          {filteredSongs.length > 0 ? (
            <div className="divide-y divide-white/5 bg-[#1C1C1E]/60 rounded-2xl border border-white/10 p-1">
              {filteredSongs.map((song, idx) => (
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
          ) : (
            <div className="p-8 rounded-2xl bg-[#1C1C1E]/40 border border-white/10 text-center space-y-2">
              <p className="text-sm text-[#8E8E93]">No local songs matched "{selectedCategory}"</p>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-[#FA233B] font-bold"
              >
                Show All Songs
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[#1C1C1E]/40 border border-white/10 text-center space-y-3">
          <Music className="w-8 h-8 text-[#8E8E93] mx-auto" />
          <p className="text-xs text-[#8E8E93]">Scan your music folder to organize tracks into categories</p>
          <button
            onClick={onOpenImport}
            className="px-4 py-2 rounded-full bg-[#FA233B] text-white text-xs font-bold hover:bg-[#ff3b50] transition-colors"
          >
            Scan Storage
          </button>
        </div>
      )}
    </div>
  );
};
