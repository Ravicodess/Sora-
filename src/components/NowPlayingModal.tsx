import React, { useState, useEffect } from 'react';
import { Song, RepeatMode } from '../types/music';
import { DominantColors, audioService } from '../services/audioService';
import { SyncedLyrics } from './SyncedLyrics';
import { QueueDrawer } from './QueueDrawer';
import { AirPlayModal } from './AirPlayModal';
import {
  ChevronDown,
  MoreHorizontal,
  Heart,
  Shuffle,
  Repeat,
  Repeat1,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Volume2,
  Volume1,
  Quote,
  ListMusic,
  Airplay,
  Sparkles
} from 'lucide-react';

interface NowPlayingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  queue: Song[];
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleFavorite: (songId: string) => void;
  onSelectSongFromQueue: (song: Song) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
  autoplay: boolean;
  onToggleAutoplay: () => void;
}

export const NowPlayingModal: React.FC<NowPlayingModalProps> = ({
  isOpen,
  onClose,
  currentSong,
  isPlaying,
  currentTime,
  duration,
  isShuffle,
  repeatMode,
  queue,
  onTogglePlay,
  onSeek,
  onPrevious,
  onNext,
  onToggleShuffle,
  onToggleRepeat,
  onToggleFavorite,
  onSelectSongFromQueue,
  onRemoveFromQueue,
  onClearQueue,
  autoplay,
  onToggleAutoplay
}) => {
  const [activeTab, setActiveTab] = useState<'cover' | 'lyrics' | 'queue'>('cover');
  const [volume, setVolume] = useState<number>(0.85);
  const [colors, setColors] = useState<DominantColors>({
    primary: '#FC3C44',
    secondary: '#861657',
    accent: '#FA233B',
    ambient: 'rgba(252, 60, 68, 0.4)'
  });
  const [isAirPlayOpen, setIsAirPlayOpen] = useState(false);
  const [currentAudioRoute, setCurrentAudioRoute] = useState('phone');

  // Format seconds into mm:ss
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatRemainingTime = (current: number, total: number) => {
    const diff = Math.max(0, total - current);
    return `-${formatTime(diff)}`;
  };

  // Update dynamic album colors when song changes
  useEffect(() => {
    if (currentSong?.coverUrl) {
      audioService.extractAlbumColors(currentSong.coverUrl).then((res) => {
        setColors(res);
      });
    }
  }, [currentSong]);

  if (!isOpen || !currentSong) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-between overflow-hidden bg-black select-none text-white animate-spring-up">
      {/* Dynamic Fluid Mesh Gradient Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-85">
        <div
          className="absolute -top-[25%] -left-[25%] w-[150%] h-[150%] blur-[130px] transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(circle at 25% 25%, ${colors.primary} 0%, transparent 60%),
                         radial-gradient(circle at 75% 75%, ${colors.secondary} 0%, transparent 60%),
                         radial-gradient(circle at 50% 50%, ${colors.accent} 0%, #000000 85%)`
          }}
        />

        {/* Floating smooth blur orbs for organic fluid motion */}
        <div
          className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-[100px] animate-orb-1 opacity-70"
          style={{ backgroundColor: colors.primary }}
        />
        <div
          className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full blur-[110px] animate-orb-2 opacity-65"
          style={{ backgroundColor: colors.secondary }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full blur-[90px] animate-orb-3 opacity-50"
          style={{ backgroundColor: colors.accent }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/85" />
      </div>

      {/* Top Header Drag Bar & Dismiss */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-[calc(env(safe-area-inset-top,16px)+12px)] pb-3">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white active:scale-90 transition-transform duration-200"
          aria-label="Dismiss"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* Centered track context info */}
        <div className="flex flex-col items-center max-w-[200px] truncate text-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-white/50">
            Playing From
          </span>
          <span className="text-xs font-semibold text-white/90 truncate">
            {currentSong.album || 'Local Storage'}
          </span>
        </div>

        <button
          className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white active:scale-90 transition-transform duration-200"
          aria-label="More options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Center Body: Cover / Lyrics / Queue */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-8 min-h-0">
        {activeTab === 'cover' && (
          <div className="w-full flex flex-col items-center justify-center my-auto transition-all duration-500 ease-out">
            {/* Squircle Album Artwork with micro-interaction spring scale */}
            <div
              className={`relative w-64 h-64 sm:w-76 sm:h-76 max-w-[76vw] max-h-[76vw] aspect-square transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isPlaying
                  ? 'scale-100 shadow-[0_28px_60px_rgba(0,0,0,0.75)]'
                  : 'scale-90 opacity-90 shadow-[0_14px_35px_rgba(0,0,0,0.5)]'
              }`}
            >
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-full h-full rounded-[26px] object-cover border border-white/15"
              />

              {/* Lossless Apple Music Badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3 h-3 text-[#FA233B]" />
                <span className="text-[10px] font-semibold tracking-wider text-white/90 uppercase">
                  {currentSong.bitrate || 'Apple Lossless'}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lyrics' && (
          <div className="w-full h-full animate-view">
            <SyncedLyrics
              lyrics={currentSong.lyrics}
              currentTime={currentTime}
              onSeek={onSeek}
            />
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="w-full h-full animate-view">
            <QueueDrawer
              currentSong={currentSong}
              queue={queue}
              onSelectSong={onSelectSongFromQueue}
              onRemoveFromQueue={onRemoveFromQueue}
              onClearQueue={onClearQueue}
              autoplay={autoplay}
              onToggleAutoplay={onToggleAutoplay}
            />
          </div>
        )}
      </div>

      {/* Bottom Controls Area */}
      <div className="relative z-10 px-8 pb-[calc(env(safe-area-inset-bottom,20px)+16px)] pt-2 max-w-lg mx-auto w-full space-y-5">
        {/* Track Info & Favorite */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col text-left overflow-hidden mr-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate leading-tight">
              {currentSong.title}
            </h2>
            <p className="text-base text-white/70 font-medium truncate mt-0.5">
              {currentSong.artist}
            </p>
          </div>

          <button
            onClick={() => onToggleFavorite(currentSong.id)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white active:scale-90 transition-transform flex-shrink-0"
            aria-label="Favorite"
          >
            <Heart
              className={`w-6 h-6 transition-all duration-300 ${
                currentSong.isFavorite
                  ? 'fill-[#FA233B] text-[#FA233B] scale-110'
                  : 'text-white/60 scale-100'
              }`}
            />
          </button>
        </div>

        {/* Scrubber Seeker Bar */}
        <div className="space-y-1.5">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-white focus:outline-none transition-all"
          />

          <div className="flex justify-between text-[11px] font-semibold text-white/60 tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{formatRemainingTime(currentTime, duration)}</span>
          </div>
        </div>

        {/* Transport Playback Controls with Spring Easing */}
        <div className="flex items-center justify-between px-2">
          {/* Shuffle */}
          <button
            onClick={onToggleShuffle}
            className={`p-2 transition-transform duration-200 active:scale-90 ${
              isShuffle ? 'text-[#FA233B]' : 'text-white/50 hover:text-white'
            }`}
            aria-label="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous */}
          <button
            onClick={onPrevious}
            className="p-3 text-white hover:text-white/80 active:scale-90 transition-transform duration-200"
            aria-label="Previous track"
          >
            <SkipBack className="w-8 h-8 fill-current" />
          </button>

          {/* Giant Play / Pause Button with Spring Feedback */}
          <button
            onClick={onTogglePlay}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-apple-float active:scale-90 transition-transform duration-200"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-black text-black" />
            ) : (
              <Play className="w-8 h-8 fill-black text-black ml-1" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            className="p-3 text-white hover:text-white/80 active:scale-90 transition-transform duration-200"
            aria-label="Next track"
          >
            <SkipForward className="w-8 h-8 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={onToggleRepeat}
            className={`p-2 transition-transform duration-200 active:scale-90 relative ${
              repeatMode !== 'off' ? 'text-[#FA233B]' : 'text-white/50 hover:text-white'
            }`}
            aria-label="Repeat mode"
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
            {repeatMode !== 'off' && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FA233B]" />
            )}
          </button>
        </div>

        {/* Volume Slider Bar */}
        <div className="flex items-center gap-3 px-3">
          <Volume1 className="w-4 h-4 text-white/50" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => {
              const val = Number(e.target.value);
              setVolume(val);
              audioService.setVolume(val);
            }}
            className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-white focus:outline-none"
          />
          <Volume2 className="w-4 h-4 text-white/50" />
        </div>

        {/* Bottom Actions Row: Lyrics, AirPlay, Queue */}
        <div className="flex items-center justify-around pt-2">
          {/* Synced Lyrics Button */}
          <button
            onClick={() => setActiveTab(activeTab === 'lyrics' ? 'cover' : 'lyrics')}
            className={`p-2.5 rounded-full transition-all duration-200 active:scale-90 ${
              activeTab === 'lyrics'
                ? 'bg-white/25 text-white scale-105'
                : 'text-white/60 hover:text-white'
            }`}
            aria-label="Lyrics"
          >
            <Quote className="w-5 h-5" />
          </button>

          {/* AirPlay / Output Route Button */}
          <button
            onClick={() => setIsAirPlayOpen(true)}
            className="p-2.5 rounded-full text-white/60 hover:text-white transition-all duration-200 active:scale-90"
            aria-label="AirPlay"
          >
            <Airplay className="w-5 h-5" />
          </button>

          {/* Up Next Queue Button */}
          <button
            onClick={() => setActiveTab(activeTab === 'queue' ? 'cover' : 'queue')}
            className={`p-2.5 rounded-full transition-all duration-200 active:scale-90 ${
              activeTab === 'queue'
                ? 'bg-white/25 text-white scale-105'
                : 'text-white/60 hover:text-white'
            }`}
            aria-label="Queue"
          >
            <ListMusic className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* AirPlay Output Selector Modal */}
      <AirPlayModal
        isOpen={isAirPlayOpen}
        onClose={() => setIsAirPlayOpen(false)}
        currentDevice={currentAudioRoute}
        onSelectDevice={setCurrentAudioRoute}
      />
    </div>
  );
};
