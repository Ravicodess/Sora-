import React, { useState } from 'react';
import { Song } from '../types/music';
import { BROWSE_CATEGORIES } from '../services/mockData';
import { SongRow } from '../components/SongRow';
import { Search as SearchIcon, X, Mic } from 'lucide-react';

interface SearchViewProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
  onAddToQueue: (song: Song) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  songs,
  currentSong,
  isPlaying,
  onPlaySong,
  onToggleFavorite,
  onAddToQueue
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter songs based on search query or selected genre
  const filteredSongs = songs.filter((s) => {
    if (selectedCategory) {
      return (
        s.genre?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        s.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        s.album.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.album.toLowerCase().includes(q) ||
      (s.genre && s.genre.toLowerCase().includes(q))
    );
  });

  return (
    <div className="pb-32 pt-14 px-4 max-w-xl mx-auto space-y-6 select-none text-left">
      {/* Title */}
      <div className="pt-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Search
        </h1>
      </div>

      {/* Apple Search Input Field */}
      <div className="relative">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-[#1C1C1E] border border-white/10 text-white focus-within:border-white/30 transition-colors">
          <SearchIcon className="w-5 h-5 text-[#8E8E93] flex-shrink-0" />
          <input
            type="text"
            placeholder="Artists, Songs, Lyrics, and More"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (selectedCategory) setSelectedCategory(null);
            }}
            className="w-full bg-transparent text-sm text-white placeholder-[#8E8E93] focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full bg-white/10 text-white/70 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Mic className="w-4 h-4 text-[#8E8E93]" />
          )}
        </div>
      </div>

      {/* Selected Category Chip */}
      {selectedCategory && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/10 border border-white/10">
          <span className="text-xs font-semibold text-white">
            Category: <strong className="text-[#FA233B]">{selectedCategory}</strong> ({filteredSongs.length} songs)
          </span>
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-xs text-[#FA233B] font-semibold"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Results View */}
      {query.trim() || selectedCategory ? (
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-bold tracking-wider text-[#8E8E93]">
            {filteredSongs.length > 0 ? `Results (${filteredSongs.length})` : 'No Results'}
          </h3>

          {filteredSongs.length === 0 ? (
            <div className="py-16 text-center text-[#8E8E93] space-y-2">
              <p className="text-base font-semibold text-white">No results found</p>
              <p className="text-xs">Check spelling or try searching for another artist or track name.</p>
            </div>
          ) : (
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
          )}
        </div>
      ) : (
        /* Browse Categories Grid */
        <div className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-white">
            Browse Categories
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {BROWSE_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`relative h-28 rounded-2xl p-3.5 flex flex-col justify-between overflow-hidden cursor-pointer shadow-md bg-gradient-to-br ${cat.color} group transition-transform active:scale-95`}
              >
                <span className="text-base font-black text-white tracking-tight drop-shadow-sm">
                  {cat.name}
                </span>

                <span className="text-3xl self-end drop-shadow-md group-hover:scale-110 transition-transform">
                  {cat.icon}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
