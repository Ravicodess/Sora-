import React from 'react';
import { Song } from '../types/music';
import { Trash2, Infinity as InfinityIcon, GripVertical, Play } from 'lucide-react';

interface QueueDrawerProps {
  currentSong: Song | null;
  queue: Song[];
  onSelectSong: (song: Song) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
  autoplay: boolean;
  onToggleAutoplay: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  currentSong,
  queue,
  onSelectSong,
  onRemoveFromQueue,
  onClearQueue,
  autoplay,
  onToggleAutoplay
}) => {
  return (
    <div className="h-full overflow-y-auto no-scrollbar px-5 py-6 pb-24 text-left select-none">
      {/* Playing Now Section */}
      {currentSong && (
        <div className="mb-6">
          <h4 className="text-xs uppercase font-bold tracking-wider text-[#8E8E93] mb-2 px-1">
            Now Playing
          </h4>
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/10 border border-white/10">
            <div className="flex items-center gap-3 overflow-hidden">
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-12 h-12 rounded-xl object-cover shadow-sm flex-shrink-0"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{currentSong.title}</p>
                <p className="text-xs text-[#8E8E93] truncate">{currentSong.artist}</p>
              </div>
            </div>

            {/* Animated sound wave bars */}
            <div className="flex items-end gap-1 h-5 px-2">
              <span className="w-1 bg-[#FA233B] rounded-full animate-bounce h-3" />
              <span className="w-1 bg-[#FA233B] rounded-full animate-pulse h-5" />
              <span className="w-1 bg-[#FA233B] rounded-full animate-bounce h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Up Next Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className="text-xs uppercase font-bold tracking-wider text-[#8E8E93]">
          Playing Next ({queue.length})
        </h4>

        <div className="flex items-center gap-3">
          {/* Autoplay Toggle */}
          <button
            onClick={onToggleAutoplay}
            className={`p-1.5 rounded-full transition-colors ${
              autoplay ? 'bg-[#FA233B] text-white' : 'bg-white/10 text-white/50'
            }`}
            title="Autoplay continuous similar music"
          >
            <InfinityIcon className="w-4 h-4" />
          </button>

          {queue.length > 0 && (
            <button
              onClick={onClearQueue}
              className="text-xs font-semibold text-[#FA233B] hover:text-[#ff4f64]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Queue Song List */}
      {queue.length === 0 ? (
        <div className="py-12 text-center text-white/40">
          <p className="text-sm">No upcoming tracks in queue</p>
          <p className="text-xs mt-1">Play an album or tap ⋯ to add songs to queue</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {queue.map((song, index) => (
            <div
              key={`${song.id}-${index}`}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 group transition-colors"
            >
              <div
                onClick={() => onSelectSong(song)}
                className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer mr-2"
              >
                <div className="relative group/play flex-shrink-0">
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover/play:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                  </div>
                </div>

                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{song.title}</p>
                  <p className="text-xs text-[#8E8E93] truncate">{song.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRemoveFromQueue(index)}
                  className="p-1.5 text-white/40 hover:text-red-400 transition-colors"
                  aria-label="Remove from queue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <GripVertical className="w-4 h-4 text-white/20 cursor-grab" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
