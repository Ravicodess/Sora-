import { Song, Playlist } from '../types/music';
import { INITIAL_SONGS, INITIAL_PLAYLISTS } from './mockData';

const DB_NAME = 'masti_music_db';
const DB_VERSION = 1;
const STORE_SONGS = 'songs';
const STORE_PLAYLISTS = 'playlists';
const STORE_SETTINGS = 'settings';

class StorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
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

      request.onsuccess = async () => {
        this.db = request.result;
        await this.seedDefaultsIfNeeded();
        resolve();
      };

      request.onerror = () => {
        console.error('IndexedDB failed to open:', request.error);
        resolve(); // resolve anyway so app continues working
      };
    });
  }

  private async seedDefaultsIfNeeded(): Promise<void> {
    const existingSongs = await this.getAllSongs();
    if (existingSongs.length === 0) {
      for (const song of INITIAL_SONGS) {
        await this.saveSong(song);
      }
    }
    const existingPlaylists = await this.getAllPlaylists();
    if (existingPlaylists.length === 0) {
      for (const pl of INITIAL_PLAYLISTS) {
        await this.savePlaylist(pl);
      }
    }
  }

  async getAllSongs(): Promise<Song[]> {
    if (!this.db) return INITIAL_SONGS;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORE_SONGS, 'readonly');
        const store = tx.objectStore(STORE_SONGS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(INITIAL_SONGS);
      } catch {
        resolve(INITIAL_SONGS);
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
    if (!this.db) return INITIAL_PLAYLISTS;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORE_PLAYLISTS, 'readonly');
        const store = tx.objectStore(STORE_PLAYLISTS);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve(INITIAL_PLAYLISTS);
      } catch {
        resolve(INITIAL_PLAYLISTS);
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

  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    if (!this.db) return defaultValue;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORE_SETTINGS, 'readonly');
        const store = tx.objectStore(STORE_SETTINGS);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ? req.result.value : defaultValue);
        req.onerror = () => resolve(defaultValue);
      } catch {
        resolve(defaultValue);
      }
    });
  }

  async setSetting<T>(key: string, value: T): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(STORE_SETTINGS, 'readwrite');
        const store = tx.objectStore(STORE_SETTINGS);
        store.put({ key, value });
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
}

export const storageService = new StorageService();
