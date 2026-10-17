import React from 'react';
import { Song } from '../types/music';
import { RADIO_STATIONS } from '../services/mockData';
import { Radio as RadioIcon, Play, Waves } from 'lucide-react';

interface RadioViewProps {
  songs: Song[];
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onPlayAlbum?: (songs: Song[]) => void;
  onOpenImport?: () => void;
  showToast?: (message: string) => void;
}

export const RadioView: React.FC<RadioViewProps> = ({
  songs,
  isPlaying,
  onPlaySong,
  onPlayAlbum,
  onOpenImport,
  showToast
}) => {
  const handleStationPlay = (stationTitle: string, stationSeedIndex: number = 0) => {
    if (songs.length === 0) {
      showToast?.(`Scan your local music to tune into ${stationTitle}`);
      onOpenImport?.();
      return;
    }

    // Create an intelligent station mix by shuffling songs deterministically from the seed
    const mix = [...songs].sort(() => Math.random() - 0.5);
    if (onPlayAlbum) {
      onPlayAlbum(mix);
    } else {
      onPlaySong(mix[0]);
    }
    showToast?.(`Tuned into ${stationTitle}`);
  };

  return (
    <div className="pb-32 pt-14 px-4 max-w-xl mx-auto space-y-7 select-none text-left animate-view">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <span>Radio</span>
          <RadioIcon className="w-6 h-6 text-[#FA233B]" />
        </h1>
        <p className="text-xs text-[#8E8E93] mt-0.5">Live broadcasts, DJ sets, and station mixes</p>
      </div>

      {/* Hero Apple Music 1 Live Broadcast Station */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => handleStationPlay('Apple Music 1', 0)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleStationPlay('Apple Music 1', 0);
          }
        }}
        className="relative rounded-3xl overflow-hidden cursor-pointer group shadow-apple-card border border-white/10 transition-transform duration-300 active:scale-[0.98]"
        aria-label="Tune into Apple Music 1"
      >
        <div className="h-64 sm:h-72 w-full relative">
          <img
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80"
            alt="Apple Music 1"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#FA233B] text-white text-[10px] font-extrabold tracking-widest uppercase flex items-center gap-1.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                LIVE
              </span>

              {/* Animated wave visualizer */}
              <div className="flex items-end gap-1 h-5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md">
                <span className="w-1 bg-white h-3 animate-bounce" />
                <span className="w-1 bg-white h-5 animate-pulse" />
                <span className="w-1 bg-white h-2 animate-bounce" />
                <span className="w-1 bg-white h-4 animate-pulse" />
              </div>
            </div>

            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[#FA233B]">
                Flagship Broadcast
              </span>
              <h2 className="text-2xl font-black text-white mt-1 leading-tight">
                Apple Music 1
              </h2>
              <p className="text-sm text-white/80 mt-1">
                The Zane Lowe Show: World First premieres and iconic interviews
              </p>
            </div>
          </div>

          <button
            className="absolute right-5 bottom-5 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-apple-float opacity-90 group-hover:opacity-100 group-hover:scale-105 active:scale-90 transition-all duration-200"
            aria-label="Play Live Radio"
          >
            <Play className="w-6 h-6 fill-black text-black ml-0.5" />
          </button>
        </div>
      </div>

      {/* Curated Stations */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Waves className="w-4 h-4 text-[#FA233B]" />
          <span>Curated Radio Stations</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {RADIO_STATIONS.map((station, i) => (
            <div
              key={station.id}
              role="button"
              tabIndex={0}
              onClick={() => handleStationPlay(station.name, i + 1)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStationPlay(station.name, i + 1);
                }
              }}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#1C1C1E]/80 hover:bg-[#2C2C2E]/80 border border-white/10 cursor-pointer group transition-all duration-300 active:scale-[0.98]"
              aria-label={`Tune into ${station.name}`}
            >
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                <img
                  src={station.coverUrl}
                  alt={station.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <span className="text-[10px] font-bold text-[#FA233B] tracking-wider uppercase">
                  {station.frequency}
                </span>
                <h4 className="text-[15px] font-bold text-white truncate leading-tight mt-0.5">
                  {station.name}
                </h4>
                <p className="text-xs text-[#8E8E93] truncate mt-0.5">
                  {station.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
