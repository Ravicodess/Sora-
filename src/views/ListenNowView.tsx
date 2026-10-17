import React from 'react';
import { Song, Playlist } from '../types/music';
import { AlbumCard } from '../components/AlbumCard';
import { SongRow } from '../components/SongRow';
import { Sparkles, FolderPlus, Play, Heart } from 'lucide-react';

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
    <div className="pb-32 pt-14 px-4 max-w-xl mx-auto space-y-7 select-none text-left">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#FA233B]">
            Masti Music
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-0.5">
            Listen Now
          </h1>
        </div>

        <button
          onClick={onOpenImport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white active:scale-95 transition-all"
        >
          <FolderPlus className="w-3.5 h-3.5 text-[#FA233B]" />
          <span>Scan Storage</span>
        </button>
      </div>

      {/* Top Picks Hero Editorial Carousel */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
          <span>Top Picks</span>
          <Sparkles className="w-4 h-4 text-[#FA233B]" />
        </h2>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 scroll-smooth">
          <AlbumCard
            title="Starboy (Deluxe Master)"
            subtitle="The Weeknd • Spatial Audio & ALAC"
            coverUrl="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&q=80"
            badge="Featured Album"
            isEditorial={true}
            onPlay={() => songs.length > 0 && onPlaySong(songs[0])}
          />
          <AlbumCard
            title="Midnight Dreams & Lo-Fi"
            subtitle="M83 • Dolby Atmos Immersive"
            coverUrl="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80"
            badge="Apple Digital Master"
            isEditorial={true}
            onPlay={() => songs.length > 1 && onPlaySong(songs[1])}
          />
          <AlbumCard
            title="Masti Desi Party Mix"
            subtitle="High Energy Bollywood & Punjabi"
            coverUrl="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80"
            badge="Top Station"
            isEditorial={true}
            onPlay={() => songs.length > 3 && onPlaySong(songs[3])}
          />
        </div>
      </div>

      {/* Device Storage Status Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 via-[#1C1C1E] to-[#1C1C1E] border border-white/10 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#FA233B]">
            Local Storage
          </span>
          <h3 className="text-base font-bold text-white mt-0.5">
            {localSongs.length} Local Tracks Indexed
          </h3>
          <p className="text-xs text-[#8E8E93] mt-0.5">
            Plays any MP3, FLAC, M4A or WAV on your device
          </p>
        </div>
        <button
          onClick={onOpenImport}
          className="px-4 py-2 rounded-full bg-[#FA233B] text-white text-xs font-bold hover:bg-[#ff3b50] active:scale-95 transition-all shadow-apple-glow"
        >
          Import
        </button>
      </div>

      {/* Heavy Rotation Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white">
            Heavy Rotation
          </h2>
          <span className="text-xs font-semibold text-[#FA233B] cursor-pointer">
            See All
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {songs.slice(0, 4).map((song) => (
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

      {/* Recently Played / Favorites Track List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Heart className="w-4 h-4 fill-[#FA233B] text-[#FA233B]" />
            <span>Favorites & Trending</span>
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
          {(favoriteSongs.length > 0 ? favoriteSongs : songs).slice(0, 5).map((song, idx) => (
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
    </div>
  );
};
