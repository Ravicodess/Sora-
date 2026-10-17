import React from 'react';
import { Song } from '../types/music';
import { Play, Pause, FastForward } from 'lucide-react';

interface MiniPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onExpand: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onNext,
  onExpand
}) => {
  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-[calc(56px+env(safe-area-inset-bottom,10px))] left-2.5 right-2.5 z-20 max-w-lg mx-auto">
      <div
        onClick={onExpand}
        className="relative flex items-center justify-between p-2 pl-2.5 pr-3 rounded-2xl bg-[#242426]/90 backdrop-blur-2xl border border-white/12 shadow-[0_12px_32px_rgba(0,0,0,0.6)] cursor-pointer select-none overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[#2c2c2e]/95 active:scale-[0.98]"
      >
        {/* Progress bar line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
          <div
            className="h-full bg-white/80 transition-all duration-200 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Left: Album cover with bloom effect */}
        <div className="flex items-center gap-3 overflow-hidden mr-2">
          <div className="relative w-11 h-11 flex-shrink-0">
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className={`w-full h-full rounded-xl object-cover shadow-md transition-transform duration-500 ease-out ${
                isPlaying ? 'scale-100' : 'scale-95 opacity-90'
              }`}
            />
          </div>
          <div className="flex flex-col overflow-hidden text-left">
            <span className="text-[14px] font-semibold text-white truncate leading-tight tracking-tight">
              {currentSong.title}
            </span>
            <span className="text-[12px] text-[#8E8E93] truncate leading-tight mt-0.5">
              {currentSong.artist}
            </span>
          </div>
        </div>

        {/* Right: Playback Controls */}
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onTogglePlay}
            className="w-9 h-9 flex items-center justify-center rounded-full text-white hover:text-white/80 active:scale-90 transition-transform duration-200"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-white" />
            ) : (
              <Play className="w-6 h-6 fill-white ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#8E8E93] hover:text-white active:scale-90 transition-transform duration-200"
            aria-label="Next track"
          >
            <FastForward className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
