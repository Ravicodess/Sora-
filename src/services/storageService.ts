import { Song, Playlist } from '../types/music';

const DB_NAME = 'sora_music_db';
const DB_VERSION = 1;
const STORE_SONGS = 'songs';
const STORE_PLAYLISTS = 'playlists';
const STORE_SETTINGS = 'settings';

class StorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_SONGS)) {
          db.createObjectStore(STORE_SONGS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_PLAYLISTS)) {
          db.createObjectStore(STORE_PLAYLISTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => {
        console.error('IndexedDB failed to open:', request.error);
        resolve();
      };
    });
  }

  async getAllSongs(): Promise<Song[]> {
    if (!this.db) return [];
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORE_SONGS, 'readonly');
        const store = tx.objectStore(STORE_SONGS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  async saveSong(song: Song): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORE_SONGS, 'readwrite');
        const store = tx.objectStore(STORE_SONGS);
        store.put(song);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  async saveSongs(songs: Song[]): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORE_SONGS, 'readwrite');
        const store = tx.objectStore(STORE_SONGS);
        for (const song of songs) {
          store.put(song);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  async deleteSong(id: string): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORE_SONGS, 'readwrite');
        const store = tx.objectStore(STORE_SONGS);
        store.delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  async getAllPlaylists(): Promise<Playlist[]> {
    if (!this.db) return [];
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORE_PLAYLISTS, 'readonly');
        const store = tx.objectStore(STORE_PLAYLISTS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }

  async savePlaylist(playlist: Playlist): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORE_PLAYLISTS, 'readwrite');
        const store = tx.objectStore(STORE_PLAYLISTS);
        store.put(playlist);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction([STORE_SONGS, STORE_PLAYLISTS], 'readwrite');
        tx.objectStore(STORE_SONGS).clear();
        tx.objectStore(STORE_PLAYLISTS).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
}

export const storageService = new StorageService();
