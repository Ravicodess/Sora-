import React, { useState, useEffect, useCallback } from 'react';
import { Song, Playlist, NavTab, RepeatMode } from './types/music';
import { storageService } from './services/storageService';
import { audioService } from './services/audioService';
import { Navbar } from './components/Navbar';
import { MiniPlayer } from './components/MiniPlayer';
import { NowPlayingModal } from './components/NowPlayingModal';
import { ImportModal } from './components/ImportModal';
import { ListenNowView } from './views/ListenNowView';
import { BrowseView } from './views/BrowseView';
import { RadioView } from './views/RadioView';
import { LibraryView } from './views/LibraryView';
import { SearchView } from './views/SearchView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('listen-now');
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const [queue, setQueue] = useState<Song[]>([]);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [autoplay, setAutoplay] = useState<boolean>(true);

  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);

  // Initialize storage & songs
  useEffect(() => {
    storageService.init().then(async () => {
      const storedSongs = await storageService.getAllSongs();
      const storedPlaylists = await storageService.getAllPlaylists();
      setSongs(storedSongs);
      setPlaylists(storedPlaylists);

      if (storedSongs.length > 0) {
        setCurrentSong(storedSongs[0]);
        // Preload metadata without playing
        audioService.loadSong(storedSongs[0], false);
      }
    });
  }, []);

  // Next Track Logic
  const handleNext = useCallback(() => {
    if (repeatMode === 'one' && currentSong) {
      audioService.seek(0);
      audioService.play();
      return;
    }

    if (queue.length > 0) {
      const nextSong = queue[0];
      setQueue((prev) => prev.slice(1));
      setCurrentSong(nextSong);
      audioService.loadSong(nextSong, true);
      return;
    }

    if (autoplay && songs.length > 0) {
      // Pick random song or next in list
      const currentIndex = currentSong ? songs.findIndex((s) => s.id === currentSong.id) : -1;
      let nextIndex = 0;
      if (isShuffle) {
        nextIndex = Math.floor(Math.random() * songs.length);
      } else if (currentIndex >= 0 && currentIndex < songs.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }

      const nextSong = songs[nextIndex];
      setCurrentSong(nextSong);
      audioService.loadSong(nextSong, true);
    }
  }, [queue, songs, currentSong, repeatMode, autoplay, isShuffle]);

  // Previous Track Logic
  const handlePrevious = useCallback(() => {
    if (currentTime > 3) {
      // If played > 3s, restart current song
      audioService.seek(0);
      return;
    }

    if (songs.length > 0 && currentSong) {
      const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : songs.length - 1;
      const prevSong = songs[prevIndex];
      setCurrentSong(prevSong);
      audioService.loadSong(prevSong, true);
    }
  }, [currentTime, songs, currentSong]);

  // Attach audio callbacks
  useEffect(() => {
    audioService.setCallbacks(
      (time, dur) => {
        setCurrentTime(time);
        setDuration(dur);
      },
      () => {
        handleNext();
      },
      (playing) => {
        setIsPlaying(playing);
      }
    );

    audioService.setMediaSessionNavigationHandlers(handlePrevious, handleNext);
  }, [handleNext, handlePrevious]);

  // Play a specific song
  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
    audioService.loadSong(song, true);

    // Increment play count
    const updated = songs.map((s) =>
      s.id === song.id ? { ...s, playCount: (s.playCount || 0) + 1 } : s
    );
    setSongs(updated);
    storageService.saveSong({ ...song, playCount: (song.playCount || 0) + 1 });
  };

  // Play an entire album or playlist
  const handlePlayAlbum = (albumSongs: Song[]) => {
    if (albumSongs.length === 0) return;
    const first = albumSongs[0];
    const rest = albumSongs.slice(1);
    setCurrentSong(first);
    setQueue(rest);
    audioService.loadSong(first, true);
  };

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    audioService.togglePlay();
  };

  // Seek
  const handleSeek = (seconds: number) => {
    audioService.seek(seconds);
    setCurrentTime(seconds);
  };

  // Toggle Repeat Mode (off -> all -> one -> off)
  const handleToggleRepeat = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    setRepeatMode(next);
  };

  // Toggle Shuffle
  const handleToggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  // Toggle Favorite
  const handleToggleFavorite = async (songId: string) => {
    const updated = songs.map((s) => {
      if (s.id === songId) {
        const toggled = !s.isFavorite;
        storageService.saveSong({ ...s, isFavorite: toggled });
        return { ...s, isFavorite: toggled };
      }
      return s;
    });
    setSongs(updated);

    if (currentSong?.id === songId) {
      setCurrentSong((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  // Add song to queue
  const handleAddToQueue = (song: Song) => {
    setQueue((prev) => [...prev, song]);
  };

  // Remove song from queue
  const handleRemoveFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear queue
  const handleClearQueue = () => {
    setQueue([]);
  };

  // Delete song
  const handleDeleteSong = async (songId: string) => {
    await storageService.deleteSong(songId);
    setSongs((prev) => prev.filter((s) => s.id !== songId));
    if (currentSong?.id === songId) {
      handleNext();
    }
  };

  // Callback when local songs are imported from device storage
  const handleSongsImported = (newSongs: Song[]) => {
    setSongs((prev) => [...newSongs, ...prev]);
    if (!currentSong && newSongs.length > 0) {
      handlePlaySong(newSongs[0]);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white font-sf flex flex-col justify-between overflow-x-hidden">
      {/* Top ambient status glow */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-gradient-to-b from-black/80 to-transparent z-20 pointer-events-none" />

      {/* Main View Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'listen-now' && (
          <ListenNowView
            songs={songs}
            playlists={playlists}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onPlayAlbum={handlePlayAlbum}
            onOpenImport={() => setIsImportOpen(true)}
            onToggleFavorite={handleToggleFavorite}
            onAddToQueue={handleAddToQueue}
          />
        )}

        {activeTab === 'browse' && (
          <BrowseView
            songs={songs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onPlayAlbum={handlePlayAlbum}
            onToggleFavorite={handleToggleFavorite}
            onAddToQueue={handleAddToQueue}
          />
        )}

        {activeTab === 'radio' && (
          <RadioView
            songs={songs}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
          />
        )}

        {activeTab === 'library' && (
          <LibraryView
            songs={songs}
            playlists={playlists}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onPlayAlbum={handlePlayAlbum}
            onOpenImport={() => setIsImportOpen(true)}
            onToggleFavorite={handleToggleFavorite}
            onAddToQueue={handleAddToQueue}
            onDeleteSong={handleDeleteSong}
          />
        )}

        {activeTab === 'search' && (
          <SearchView
            songs={songs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onToggleFavorite={handleToggleFavorite}
            onAddToQueue={handleAddToQueue}
          />
        )}
      </main>

      {/* Persistent Mini Player */}
      <MiniPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onTogglePlay={handleTogglePlay}
        onNext={handleNext}
        onExpand={() => setIsNowPlayingOpen(true)}
      />

      {/* Bottom 5-Tab Navigation Bar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Full-Screen Now Playing Modal */}
      <NowPlayingModal
        isOpen={isNowPlayingOpen}
        onClose={() => setIsNowPlayingOpen(false)}
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        queue={queue}
        onTogglePlay={handleTogglePlay}
        onSeek={handleSeek}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToggleShuffle={handleToggleShuffle}
        onToggleRepeat={handleToggleRepeat}
        onToggleFavorite={handleToggleFavorite}
        onSelectSongFromQueue={handlePlaySong}
        onRemoveFromQueue={handleRemoveFromQueue}
        onClearQueue={handleClearQueue}
        autoplay={autoplay}
        onToggleAutoplay={() => setAutoplay((prev) => !prev)}
      />

      {/* Device Music Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSongsImported={handleSongsImported}
      />
    </div>
  );
};
