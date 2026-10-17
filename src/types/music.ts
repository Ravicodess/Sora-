export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  url: string; // Blob URL or remote URL
  coverUrl: string; // Base64 data URL, Blob URL, or remote URL
  lyrics?: LyricLine[];
  genre?: string;
  year?: number | string;
  trackNumber?: number;
  isFavorite?: boolean;
  playCount?: number;
  addedAt?: number;
  format?: string; // mp3, flac, m4a, etc.
  bitrate?: string; // e.g. "Lossless 24-bit/48kHz"
  isLocal?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  songIds: string[];
  createdAt: number;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  year?: number | string;
  songs: Song[];
}

export interface Artist {
  id: string;
  name: string;
  avatarUrl: string;
  albums: Album[];
  songs: Song[];
}

export type RepeatMode = 'off' | 'all' | 'one';

export type NavTab = 'listen-now' | 'browse' | 'radio' | 'library' | 'search';

export type LibraryCategory = 'main' | 'playlists' | 'artists' | 'albums' | 'songs' | 'downloaded';
