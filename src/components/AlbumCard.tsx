import React from 'react';
import { Play } from 'lucide-react';

interface AlbumCardProps {
  title: string;
  subtitle?: string;
  coverUrl: string;
  badge?: string;
  isEditorial?: boolean;
  onPlay?: () => void;
  onClick?: () => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({
  title,
  subtitle,
  coverUrl,
  badge,
  isEditorial = false,
  onPlay,
  onClick
}) => {
  if (isEditorial) {
    return (
      <div
        onClick={onClick || onPlay}
        className="relative flex-shrink-0 w-72 sm:w-80 h-44 rounded-2xl overflow-hidden cursor-pointer group shadow-apple-card border border-white/10 select-none"
      >
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col justify-end text-left">
          {badge && (
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#FA233B] mb-1">
              {badge}
            </span>
          )}
          <h3 className="text-lg font-bold text-white leading-snug line-clamp-1">{title}</h3>
          {subtitle && (
            <p className="text-xs text-white/70 line-clamp-1 mt-0.5">{subtitle}</p>
          )}
        </div>

        {onPlay && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            className="absolute right-3 bottom-3 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
            aria-label="Play album"
          >
            <Play className="w-5 h-5 fill-black text-black ml-0.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick || onPlay}
      className="flex flex-col text-left cursor-pointer group select-none"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden shadow-apple-card border border-white/10 mb-2">
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {onPlay && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            className="absolute right-2.5 bottom-2.5 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
            aria-label="Play"
          >
            <Play className="w-5 h-5 fill-black text-black ml-0.5" />
          </button>
        )}
      </div>
      <h4 className="text-[14px] font-semibold text-white truncate leading-tight">{title}</h4>
      {subtitle && (
        <p className="text-[12px] text-[#8E8E93] truncate leading-tight mt-0.5">{subtitle}</p>
      )}
    </div>
  );
};
