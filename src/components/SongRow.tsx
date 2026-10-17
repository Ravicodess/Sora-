import React, { useState } from 'react';
import { Song } from '../types/music';
import { MoreHorizontal, Play, Heart, Trash2, ListPlus } from 'lucide-react';

interface SongRowProps {
  song: Song;
  index?: number;
  isCurrent?: boolean;
  isPlaying?: boolean;
  onPlay: (song: Song) => void;
  onToggleFavorite?: (songId: string) => void;
  onAddToQueue?: (song: Song) => void;
  onDelete?: (songId: string) => void;
}

export const SongRow: React.FC<SongRowProps> = ({
  song,
  index,
  isCurrent,
  isPlaying,
  onPlay,
  onToggleFavorite,
  onAddToQueue,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // Format seconds into m:ss
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative group">
      <div
        onClick={() => onPlay(song)}
        className={`flex items-center justify-between py-2 px-3 rounded-xl transition-colors cursor-pointer select-none ${
          isCurrent ? 'bg-white/10' : 'hover:bg-white/5 active:bg-white/10'
        }`}
      >
        {/* Left: Thumbnail & Song Info */}
        <div className="flex items-center gap-3 overflow-hidden mr-3">
          {song.coverUrl ? (
            <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-900 border border-white/10 shadow-sm">
              <img
                src={song.coverUrl}
                alt={song.title}
                className="w-full h-full object-cover"
              />
              {isCurrent && isPlaying && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 bg-[#FA233B] h-2 animate-bounce" />
                    <span className="w-0.5 bg-[#FA233B] h-3 animate-pulse" />
                    <span className="w-0.5 bg-[#FA233B] h-1.5 animate-bounce" />
                  </div>
                </div>
              )}
            </div>
          ) : index !== undefined ? (
            <span className="w-6 text-center text-xs font-semibold text-[#8E8E93]">
              {index + 1}
            </span>
          ) : null}

          <div className="flex flex-col text-left overflow-hidden">
            <span
              className={`text-[15px] font-semibold truncate leading-tight ${
                isCurrent ? 'text-[#FA233B]' : 'text-white'
              }`}
            >
              {song.title}
            </span>
            <span className="text-[12px] text-[#8E8E93] truncate leading-tight mt-0.5">
              {song.artist}
            </span>
          </div>
        </div>

        {/* Right: Duration, Favorite, and ⋯ Menu */}
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(song.id)}
              className="p-1.5 text-white/40 hover:text-[#FA233B] transition-colors"
              aria-label="Favorite"
            >
              <Heart
                className={`w-4 h-4 ${
                  song.isFavorite ? 'fill-[#FA233B] text-[#FA233B]' : 'text-white/30'
                }`}
              />
            </button>
          )}

          <span className="text-xs font-medium text-[#8E8E93] tabular-nums hidden sm:inline">
            {formatDuration(song.duration)}
          </span>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            aria-label="Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Menu Dropdown */}
      {showMenu && (
        <div
          className="absolute right-2 top-10 z-30 w-48 rounded-2xl bg-[#2C2C2E] border border-white/10 shadow-apple-card p-1.5 animate-fade-in text-left text-sm"
          onClick={() => setShowMenu(false)}
        >
          {onAddToQueue && (
            <button
              onClick={() => {
                onAddToQueue(song);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white hover:bg-white/10"
            >
              <ListPlus className="w-4 h-4 text-white/70" />
              <span>Play Next</span>
            </button>
          )}

          {onToggleFavorite && (
            <button
              onClick={() => {
                onToggleFavorite(song.id);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white hover:bg-white/10"
            >
              <Heart className="w-4 h-4 text-[#FA233B]" />
              <span>{song.isFavorite ? 'Favorited' : 'Favorite'}</span>
            </button>
          )}

          {onDelete && song.isLocal && (
            <button
              onClick={() => {
                onDelete(song.id);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove from Library</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
