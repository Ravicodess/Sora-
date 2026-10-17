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

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; visible: boolean } | null>(null);

  const showToast = useCallback((message: string, durationMs: number = 2400) => {
    setToast({ message, visible: true });
    const timer = setTimeout(() => {
      setToast((prev) => (prev?.message === message ? { ...prev, visible: false } : prev));
    }, durationMs);
    return () => clearTimeout(timer);
  }, []);

  // Initialize storage, preferences, and songs
  useEffect(() => {
    storageService.init().then(async () => {
      const storedSongs = await storageService.getAllSongs();
      const storedPlaylists = await storageService.getAllPlaylists();
      setSongs(storedSongs);
      setPlaylists(storedPlaylists);

      // Load user preferences
      const [savedShuffle, savedRepeat, savedAutoplay, savedVolume] = await Promise.all([
        storageService.getSetting<boolean>('isShuffle', false),
        storageService.getSetting<RepeatMode>('repeatMode', 'off'),
        storageService.getSetting<boolean>('autoplay', true),
        storageService.getSetting<number>('volume', 1.0)
      ]);

      setIsShuffle(savedShuffle);
      setRepeatMode(savedRepeat);
      setAutoplay(savedAutoplay);
      audioService.setVolume(savedVolume);

      if (storedSongs.length > 0) {
        setCurrentSong(storedSongs[0]);
        // Preload metadata without playing
        audioService.loadSong(storedSongs[0], false);
      }
    });

    // Save volume changes to persistent storage
    audioService.onVolumeChange = (vol) => {
      storageService.saveSetting('volume', vol);
    };
  }, []);

  // Next Track Logic: Distinguishes between automatic track completion and explicit user skip
  const handleNext = useCallback(
    (isAutoTransition: boolean = false) => {
      if (isAutoTransition && repeatMode === 'one' && currentSong) {
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

      if (songs.length > 0) {
        // Automatic transition halts if autoplay is disabled
        if (isAutoTransition && !autoplay) {
          setIsPlaying(false);
          return;
        }

        const currentIndex = currentSong ? songs.findIndex((s) => s.id === currentSong.id) : -1;
        let nextIndex = 0;

        if (isShuffle) {
          if (songs.length > 1) {
            do {
              nextIndex = Math.floor(Math.random() * songs.length);
            } while (nextIndex === currentIndex);
          } else {
            nextIndex = 0;
          }
        } else if (currentIndex >= 0 && currentIndex < songs.length - 1) {
          nextIndex = currentIndex + 1;
        } else if (repeatMode === 'all' || !isAutoTransition) {
          // Wrap to start on explicit user skip or repeat-all
          nextIndex = 0;
        } else {
          setIsPlaying(false);
          return;
        }

        const nextSong = songs[nextIndex];
        setCurrentSong(nextSong);
        audioService.loadSong(nextSong, true);
      }
    },
    [queue, songs, currentSong, repeatMode, autoplay, isShuffle]
  );

  const handleUserNext = useCallback(() => {
    handleNext(false);
  }, [handleNext]);

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

  // Toggle Play / Pause
  const handleTogglePlay = useCallback(() => {
    audioService.togglePlay();
  }, []);

  // Attach audio callbacks
  useEffect(() => {
    audioService.setCallbacks(
      (time, dur) => {
        setCurrentTime(time);
        setDuration(dur);
      },
      () => {
        // Track ended -> auto transition
        handleNext(true);
      },
      (playing) => {
        setIsPlaying(playing);
      }
    );

    audioService.setMediaSessionNavigationHandlers(handlePrevious, handleUserNext);
  }, [handleNext, handleUserNext, handlePrevious]);

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

  // Seek
  const handleSeek = (seconds: number) => {
    audioService.seek(seconds);
    setCurrentTime(seconds);
  };

  // Toggle Repeat Mode (off -> all -> one -> off)
  const handleToggleRepeat = useCallback(() => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    setRepeatMode(next);
    storageService.saveSetting('repeatMode', next);
    showToast(next === 'one' ? 'Repeat One' : next === 'all' ? 'Repeat All' : 'Repeat Off');
  }, [repeatMode, showToast]);

  // Toggle Shuffle
  const handleToggleShuffle = useCallback(() => {
    setIsShuffle((prev) => {
      const next = !prev;
      storageService.saveSetting('isShuffle', next);
      showToast(next ? 'Shuffle On' : 'Shuffle Off');
      return next;
    });
  }, [showToast]);

  // Toggle Autoplay
  const handleToggleAutoplay = useCallback(() => {
    setAutoplay((prev) => {
      const next = !prev;
      storageService.saveSetting('autoplay', next);
      showToast(next ? 'Autoplay On' : 'Autoplay Off');
      return next;
    });
  }, [showToast]);

  // Toggle Favorite
  const handleToggleFavorite = async (songId: string) => {
    let nowFavorite = false;
    const updated = songs.map((s) => {
      if (s.id === songId) {
        const toggled = !s.isFavorite;
        nowFavorite = toggled;
        storageService.saveSong({ ...s, isFavorite: toggled });
        return { ...s, isFavorite: toggled };
      }
      return s;
    });
    setSongs(updated);

    if (currentSong?.id === songId) {
      setCurrentSong((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
    showToast(nowFavorite ? 'Added to Favorites' : 'Removed from Favorites');
  };

  // Add song to queue
  const handleAddToQueue = (song: Song) => {
    setQueue((prev) => [...prev, song]);
    showToast('Added to Up Next');
  };

  // Remove song from queue
  const handleRemoveFromQueue = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    showToast('Removed from Up Next');
  };

  // Clear queue
  const handleClearQueue = () => {
    setQueue([]);
    showToast('Queue Cleared');
  };

  // Delete song
  const handleDeleteSong = async (songId: string) => {
    await storageService.deleteSong(songId);
    setSongs((prev) => prev.filter((s) => s.id !== songId));
    if (currentSong?.id === songId) {
      handleUserNext();
    }
    showToast('Song deleted from library');
  };

  // Callback when local songs are imported from device storage
  const handleSongsImported = (newSongs: Song[]) => {
    setSongs((prev) => [...newSongs, ...prev]);
    showToast(`Loaded ${newSongs.length} local track${newSongs.length > 1 ? 's' : ''}`);
    if (!currentSong && newSongs.length > 0) {
      handlePlaySong(newSongs[0]);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'SELECT' ||
        (activeEl as HTMLElement)?.isContentEditable;

      if (isInput) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowRight') {
        if (e.shiftKey) {
          handleUserNext();
        } else {
          audioService.seek(Math.min(duration, currentTime + 5));
        }
      } else if (e.code === 'ArrowLeft') {
        if (e.shiftKey) {
          handlePrevious();
        } else {
          audioService.seek(Math.max(0, currentTime - 5));
        }
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        const newVol = Math.min(1, audioService.getVolume() + 0.05);
        audioService.setVolume(newVol);
        showToast(`Volume ${Math.round(newVol * 100)}%`);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        const newVol = Math.max(0, audioService.getVolume() - 0.05);
        audioService.setVolume(newVol);
        showToast(`Volume ${Math.round(newVol * 100)}%`);
      } else if (e.code === 'KeyM') {
        const isMuted = audioService.toggleMute();
        showToast(isMuted ? 'Audio Muted' : 'Audio Unmuted');
      } else if (e.code === 'KeyN') {
        handleUserNext();
      } else if (e.code === 'KeyP') {
        handlePrevious();
      } else if (e.code === 'KeyS') {
        handleToggleShuffle();
      } else if (e.code === 'KeyR') {
        handleToggleRepeat();
      } else if (e.code === 'Escape') {
        setIsNowPlayingOpen(false);
        setIsImportOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentTime,
    duration,
    handleUserNext,
    handlePrevious,
    handleTogglePlay,
    handleToggleShuffle,
    handleToggleRepeat,
    showToast
  ]);

  return (
    <div className="relative min-h-screen w-full bg-black text-white font-sf flex flex-col justify-between overflow-x-hidden">
      {/* Top ambient status glow */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-gradient-to-b from-black/80 to-transparent z-20 pointer-events-none" />

      {/* Floating Apple-Style Dynamic Glass Toast */}
      {toast?.visible && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-view">
          <div className="backdrop-blur-2xl bg-[#1C1C1E]/90 border border-white/15 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#FA233B] animate-pulse" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

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
            onOpenImport={() => setIsImportOpen(true)}
            showToast={showToast}
          />
        )}

        {activeTab === 'radio' && (
          <RadioView
            songs={songs}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onPlayAlbum={handlePlayAlbum}
            onOpenImport={() => setIsImportOpen(true)}
            showToast={showToast}
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
        onNext={handleUserNext}
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
        onNext={handleUserNext}
        onToggleShuffle={handleToggleShuffle}
        onToggleRepeat={handleToggleRepeat}
        onToggleFavorite={handleToggleFavorite}
        onSelectSongFromQueue={handlePlaySong}
        onRemoveFromQueue={handleRemoveFromQueue}
        onClearQueue={handleClearQueue}
        autoplay={autoplay}
        onToggleAutoplay={handleToggleAutoplay}
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
