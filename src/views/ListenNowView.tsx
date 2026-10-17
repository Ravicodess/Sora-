import React from 'react';
import { Song, Playlist } from '../types/music';
import { AlbumCard } from '../components/AlbumCard';
import { SongRow } from '../components/SongRow';
import { Sparkles, FolderPlus, Play, Heart, Music, HardDrive } from 'lucide-react';

interface ListenNowViewProps {
  songs: Song[];
  playlists: Playlist[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onPlayAlbum: (songs: Song[]) => void;
  onOpenImport: () => void;
  onToggleFavorite: (songId: string) => void;
  onAddToQueue: (song: Song) => void;
}

export const ListenNowView: React.FC<ListenNowViewProps> = ({
  songs,
  playlists,
  currentSong,
  isPlaying,
  onPlaySong,
  onPlayAlbum,
  onOpenImport,
  onToggleFavorite,
  onAddToQueue
}) => {
  const favoriteSongs = songs.filter((s) => s.isFavorite);
  const localSongs = songs.filter((s) => s.isLocal);

  return (
    <div className="pb-32 pt-14 px-4 max-w-xl mx-auto space-y-7 select-none text-left animate-view">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#FA233B]">
            Sora
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-0.5">
            Listen Now
          </h1>
        </div>

        <button
          onClick={onOpenImport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/12 text-xs font-semibold text-white active:scale-95 transition-all duration-200"
        >
          <FolderPlus className="w-3.5 h-3.5 text-[#FA233B]" />
          <span>Scan Storage</span>
        </button>
      </div>

      {/* Empty State when no local songs are scanned yet */}
      {songs.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[#1C1C1E]/80 border border-white/10 text-center space-y-5 shadow-apple-card animate-view">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#FA233B] to-[#FF2D55] flex items-center justify-center shadow-apple-glow">
            <Music className="w-10 h-10 text-white" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Welcome to Sora
            </h2>
            <p className="text-sm text-[#8E8E93] max-w-xs mx-auto">
              Sora plays local downloaded music on your device with Apple Music's fluid UI/UX.
            </p>
          </div>

          <button
            onClick={onOpenImport}
            className="w-full py-3.5 rounded-2xl bg-[#FA233B] text-white font-bold text-sm hover:bg-[#ff3b50] active:scale-95 transition-all duration-200 shadow-apple-glow flex items-center justify-center gap-2"
          >
            <HardDrive className="w-4 h-4" />
            <span>Scan Device Storage</span>
          </button>

          <p className="text-[11px] text-[#8E8E93]">
            Supports MP3, FLAC, M4A, WAV, AAC, and OGG • 100% Offline
          </p>
        </div>
      ) : (
        <>
          {/* Storage Status Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#1C1C1E] to-[#1C1C1E] border border-white/10 flex items-center justify-between transition-all">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#FA233B]">
                Local Storage
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {localSongs.length} Local Tracks Indexed
              </h3>
              <p className="text-xs text-[#8E8E93] mt-0.5">
                Offline high-fidelity playback
              </p>
            </div>
            <button
              onClick={onOpenImport}
              className="px-4 py-2 rounded-full bg-[#FA233B] text-white text-xs font-bold hover:bg-[#ff3b50] active:scale-95 transition-all duration-200 shadow-apple-glow"
            >
              Add Music
            </button>
          </div>

          {/* Heavy Rotation Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Recently Added
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {songs.slice(0, 6).map((song) => (
                <AlbumCard
                  key={song.id}
                  title={song.title}
                  subtitle={song.artist}
                  coverUrl={song.coverUrl}
                  onPlay={() => onPlaySong(song)}
                />
              ))}
            </div>
          </div>

          {/* Favorites & Tracks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <Heart className="w-4 h-4 fill-[#FA233B] text-[#FA233B]" />
                <span>{favoriteSongs.length > 0 ? 'Favorite Tracks' : 'Your Songs'}</span>
              </h2>
              <button
                onClick={() => onPlayAlbum(favoriteSongs.length ? favoriteSongs : songs)}
                className="flex items-center gap-1 text-xs font-semibold text-[#FA233B]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play All</span>
              </button>
            </div>

            <div className="divide-y divide-white/5 bg-[#1C1C1E]/60 rounded-2xl border border-white/10 p-1">
              {(favoriteSongs.length > 0 ? favoriteSongs : songs).slice(0, 8).map((song, idx) => (
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
        </>
      )}
    </div>
  );
};
