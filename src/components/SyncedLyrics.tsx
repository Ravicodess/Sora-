import React, { useEffect, useRef } from 'react';
import { LyricLine } from '../types/music';

interface SyncedLyricsProps {
  lyrics?: LyricLine[];
  currentTime: number;
  onSeek: (seconds: number) => void;
}

export const SyncedLyrics: React.FC<SyncedLyricsProps> = ({
  lyrics,
  currentTime,
  onSeek
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Find active line index
  let activeIndex = -1;
  if (lyrics && lyrics.length > 0) {
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        activeIndex = i;
        break;
      }
    }
  }

  // Auto-scroll to center the active line smoothly
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex]);

  if (!lyrics || lyrics.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-white/50 space-y-3">
        <span className="text-3xl">🎙️</span>
        <p className="text-lg font-medium text-white/80">Lyrics Not Available</p>
        <p className="text-xs text-white/40 max-w-xs">
          Synced lyrics will be displayed automatically when available in the audio file metadata or embedded LRC tags.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto no-scrollbar px-6 py-20 space-y-6 text-left select-none scroll-smooth"
    >
      {lyrics.map((line, idx) => {
        const isActive = idx === activeIndex;
        const isPast = idx < activeIndex;

        return (
          <div
            key={idx}
            ref={isActive ? activeLineRef : null}
            onClick={() => onSeek(line.time)}
            className={`transition-all duration-500 cursor-pointer origin-left py-1 ${
              isActive
                ? 'text-white text-2xl md:text-3xl font-extrabold scale-105 filter drop-shadow-[0_4px_16px_rgba(255,255,255,0.4)]'
                : isPast
                ? 'text-white/40 text-xl md:text-2xl font-bold hover:text-white/70'
                : 'text-white/30 text-xl md:text-2xl font-bold blur-[0.4px] hover:text-white/60'
            }`}
          >
            {line.text}
          </div>
        );
      })}
    </div>
  );
};
