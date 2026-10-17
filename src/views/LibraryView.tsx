import React, { useState } from 'react';
import { Song, Playlist, LibraryCategory } from '../types/music';
import { AlbumCard } from '../components/AlbumCard';
import { SongRow } from '../components/SongRow';
import {
  ListMusic,
  UserCheck,
  Disc,
  Music,
  ArrowDownCircle,
  ChevronRight,
  ChevronLeft,
  FolderPlus,
  Play,
  Shuffle
} from 'lucide-react';

interface LibraryViewProps {
  songs: Song[];
  playlists: Playlist[];
  currentSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onPlayAlbum: (songs: Song[]) => void;
  onOpenImport: () => void;
  onToggleFavorite: (songId: string) => void;
  onAddToQueue: (song: Song) => void;
  onDeleteSong?: (songId: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  songs,
  playlists,
  currentSong,
  isPlaying,
  onPlaySong,
  onPlayAlbum,
  onOpenImport,
  onToggleFavorite,
  onAddToQueue,
  onDeleteSong
}) => {
  const [activeCategory, setActiveCategory] = useState<LibraryCategory>('main');

  const localSongs = songs.filter((s) => s.isLocal);

  const categories = [
    { id: 'playlists' as LibraryCategory, name: 'Playlists', icon: <ListMusic className="w-5 h-5 text-[#FA233B]" /> },
    { id: 'artists' as LibraryCategory, name: 'Artists', icon: <UserCheck className="w-5 h-5 text-[#FA233B]" /> },
    { id: 'albums' as LibraryCategory, name: 'Albums', icon: <Disc className="w-5 h-5 text-[#FA233B]" /> },
    { id: 'songs' as LibraryCategory, name: 'Songs', count: songs.length, icon: <Music className="w-5 h-5 text-[#FA233B]" /> },
    { id: 'downloaded' as LibraryCategory, name: 'Downloaded / Local Device Storage', count: localSongs.length, icon: <ArrowDownCircle className="w-5 h-5 text-[#FA233B]" /> },
  ];

  // Group unique albums
  const albumsMap = new Map<string, { title: string; artist: string; coverUrl: string; songs: Song[] }>();
  for (const s of songs) {
    if (!albumsMap.has(s.album)) {
      albumsMap.set(s.album, {
        title: s.album,
        artist: s.artist,
        coverUrl: s.coverUrl,
        songs: [s]
      });
    } else {
      albumsMap.get(s.album)!.songs.push(s);
    }
  }
  const albumsList = Array.from(albumsMap.values());

  // Group unique artists
  const artistsMap = new Map<string, Song[]>();
  for (const s of songs) {
    if (!artistsMap.has(s.artist)) {
      artistsMap.set(s.artist, [s]);
    } else {
      artistsMap.get(s.artist)!.push(s);
    }
  }
  const artistsList = Array.from(artistsMap.entries()).map(([artist, sList]) => ({
    name: artist,
    count: sList.length,
    coverUrl: sList[0].coverUrl,
    songs: sList
  }));

  // If inside a sub-category
  if (activeCategory !== 'main') {
    const title =
      activeCategory === 'songs'
        ? `All Songs (${songs.length})`
        : activeCategory === 'downloaded'
        ? `Downloaded (${localSongs.length})`
        : activeCategory === 'albums'
        ? `Albums (${albumsList.length})`
        : activeCategory === 'artists'
        ? `Artists (${artistsList.length})`
        : `Playlists (${playlists.length})`;

    const displayedSongs = activeCategory === 'downloaded' ? localSongs : songs;

    return (
      <div className="pb-32 pt-14 px-4 max-w-xl mx-auto space-y-5 select-none text-left animate-view">
        {/* Sub-header with back arrow */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setActiveCategory('main')}
            className="flex items-center gap-1 text-sm font-semibold text-[#FA233B] hover:text-[#ff4f64] transition-colors active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Library</span>
          </button>

          {displayedSongs.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPlayAlbum(displayedSongs)}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-90 transition-transform"
                title="Play All"
              >
                <Play className="w-4 h-4 fill-white ml-0.5" />
              </button>
              <button
                onClick={() => {
                  const shuffled = [...displayedSongs].sort(() => Math.random() - 0.5);
                  onPlayAlbum(shuffled);
                }}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-90 transition-transform"
                title="Shuffle All"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>

        {/* Albums sub-view */}
        {activeCategory === 'albums' && (
          <div>
            {albumsList.length === 0 ? (
              <div className="py-16 text-center text-white/40 space-y-3">
                <p className="text-sm">No albums found in device storage</p>
                <button
                  onClick={onOpenImport}
                  className="px-5 py-2.5 rounded-full bg-[#FA233B] text-white text-xs font-bold active:scale-95 transition-all shadow-apple-glow"
                >
                  Scan Device Storage
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {albumsList.map((alb, i) => (
                  <AlbumCard
                    key={i}
                    title={alb.title}
                    subtitle={`${alb.artist} • ${alb.songs.length} tracks`}
                    coverUrl={alb.coverUrl}
                    onPlay={() => onPlayAlbum(alb.songs)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Artists sub-view */}
        {activeCategory === 'artists' && (
          <div>
            {artistsList.length === 0 ? (
              <div className="py-16 text-center text-white/40 space-y-3">
                <p className="text-sm">No artists found in device storage</p>
                <button
                  onClick={onOpenImport}
                  className="px-5 py-2.5 rounded-full bg-[#FA233B] text-white text-xs font-bold active:scale-95 transition-all shadow-apple-glow"
                >
                  Scan Device Storage
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/5 bg-[#1C1C1E]/60 rounded-2xl border border-white/10 p-2">
                {artistsList.map((art, i) => (
                  <div
                    key={i}
                    onClick={() => onPlayAlbum(art.songs)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer active:scale-[0.99] transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={art.coverUrl}
                        alt={art.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-base font-semibold text-white">{art.name}</h4>
                        <p className="text-xs text-[#8E8E93]">{art.count} songs</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Songs / Downloaded list */}
        {(activeCategory === 'songs' || activeCategory === 'downloaded') && (
          <div>
            {displayedSongs.length === 0 ? (
              <div className="py-16 text-center text-white/40 space-y-3">
                <p className="text-sm">No music files found in this section</p>
                <button
                  onClick={onOpenImport}
                  className="px-5 py-2.5 rounded-full bg-[#FA233B] text-white text-xs font-bold active:scale-95 transition-all shadow-apple-glow"
                >
                  Scan Device Storage
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/5 bg-[#1C1C1E]/60 rounded-2xl border border-white/10 p-1">
                {displayedSongs.map((song, idx) => (
                  <SongRow
                    key={song.id}
                    song={song}
                    index={idx}
                    isCurrent={currentSong?.id === song.id}
                    isPlaying={isPlaying}
                    onPlay={onPlaySong}
                    onToggleFavorite={onToggleFavorite}
                    onAddToQueue={onAddToQueue}
                    onDelete={onDeleteSong}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Playlists sub-view */}
        {activeCategory === 'playlists' && (
          <div>
            {playlists.length === 0 ? (
              <div className="py-16 text-center text-white/40 space-y-3">
                <p className="text-sm">No playlists created yet</p>
                <button
                  onClick={onOpenImport}
                  className="px-5 py-2.5 rounded-full bg-[#FA233B] text-white text-xs font-bold active:scale-95 transition-all shadow-apple-glow"
                >
                  Import Local Songs
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {playlists.map((pl) => (
                  <AlbumCard
                    key={pl.id}
                    title={pl.name}
                    subtitle={`${pl.songIds.length} songs`}
                    coverUrl={pl.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'}
                    onPlay={() => {
                      const plSongs = songs.filter((s) => pl.songIds.includes(s.id));
                      onPlayAlbum(plSongs.length ? plSongs : songs);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Main Library View
  return (
    <div className="pb-32 pt-14 px-4 max-w-xl mx-auto space-y-6 select-none text-left animate-view">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Library
        </h1>

        <button
          onClick={onOpenImport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FA233B] text-xs font-bold text-white active:scale-95 transition-all shadow-apple-glow"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>Import Music</span>
        </button>
      </div>

      {/* Classic Apple Music Library Category List */}
      <div className="divide-y divide-white/10 border-t border-b border-white/10">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className="flex items-center justify-between py-3.5 px-1 hover:bg-white/5 cursor-pointer group transition-colors active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                {cat.icon}
              </div>
              <span className="text-[17px] font-semibold text-white">
                {cat.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {cat.count !== undefined && (
                <span className="text-xs text-[#8E8E93] font-medium">
                  {cat.count}
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-[#8E8E93] group-hover:text-white transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* Recently Added Section */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Recently Added
        </h2>

        {albumsList.length === 0 ? (
          <div className="py-10 text-center text-[#8E8E93] bg-[#1C1C1E]/40 rounded-2xl border border-white/5 p-4">
            <p className="text-sm font-semibold text-white">No albums scanned</p>
            <p className="text-xs mt-1">Tap "Import Music" above to add your local MP3s & FLACs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {albumsList.slice(0, 6).map((alb, i) => (
              <AlbumCard
                key={i}
                title={alb.title}
                subtitle={alb.artist}
                coverUrl={alb.coverUrl}
                onPlay={() => onPlayAlbum(alb.songs)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
