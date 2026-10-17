import { Song } from '../types/music';

export interface DominantColors {
  primary: string;
  secondary: string;
  accent: string;
  ambient: string;
}

class AudioService {
  private audio: HTMLAudioElement;
  private currentSong: Song | null = null;
  private onTimeUpdateCallback: ((time: number, duration: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;
  private onPlayStateChangeCallback: ((isPlaying: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';

    this.audio.addEventListener('timeupdate', () => {
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.audio.currentTime, this.audio.duration || 0);
      }
      this.updatePositionState();
    });

    this.audio.addEventListener('play', () => {
      if (this.onPlayStateChangeCallback) this.onPlayStateChangeCallback(true);
    });

    this.audio.addEventListener('pause', () => {
      if (this.onPlayStateChangeCallback) this.onPlayStateChangeCallback(false);
    });

    this.audio.addEventListener('ended', () => {
      if (this.onEndedCallback) this.onEndedCallback();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio playback error', e);
      if (this.onErrorCallback) {
        this.onErrorCallback('Audio stream could not be loaded or format unsupported.');
      }
    });

    this.setupMediaSession();
  }

  setCallbacks(
    onTimeUpdate: (time: number, duration: number) => void,
    onEnded: () => void,
    onPlayStateChange: (isPlaying: boolean) => void,
    onError?: (error: string) => void
  ) {
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onEndedCallback = onEnded;
    this.onPlayStateChangeCallback = onPlayStateChange;
    if (onError) this.onErrorCallback = onError;
  }

  async loadSong(song: Song, autoPlay = true): Promise<void> {
    this.currentSong = song;
    this.audio.src = song.url;
    this.updateMediaSessionMetadata(song);

    if (autoPlay) {
      try {
        await this.audio.play();
      } catch (err) {
        console.warn('AutoPlay blocked or failed', err);
      }
    }
  }

  play(): Promise<void> {
    return this.audio.play();
  }

  pause(): void {
    this.audio.pause();
  }

  togglePlay(): void {
    if (this.audio.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  seek(seconds: number): void {
    if (isFinite(seconds) && seconds >= 0) {
      this.audio.currentTime = seconds;
    }
  }

  setVolume(volume: number): void {
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume(): number {
    return this.audio.volume;
  }

  getCurrentTime(): number {
    return this.audio.currentTime || 0;
  }

  getDuration(): number {
    return this.audio.duration || (this.currentSong ? this.currentSong.duration : 0);
  }

  isPlaying(): boolean {
    return !this.audio.paused;
  }

  // Android MediaSession API implementation for Lock Screen & Notification Center
  private setupMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          this.seek(details.seekTime);
        }
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        this.seek(Math.max(0, this.audio.currentTime - (details.seekOffset || 10)));
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        this.seek(Math.min(this.audio.duration, this.audio.currentTime + (details.seekOffset || 10)));
      });
    }
  }

  setMediaSessionNavigationHandlers(onPrev: () => void, onNext: () => void) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('previoustrack', onPrev);
      navigator.mediaSession.setActionHandler('nexttrack', onNext);
    }
  }

  private updateMediaSessionMetadata(song: Song) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album,
        artwork: [
          { src: song.coverUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: song.coverUrl, sizes: '256x256', type: 'image/jpeg' },
          { src: song.coverUrl, sizes: '512x512', type: 'image/jpeg' },
        ]
      });
    }
  }

  private updatePositionState() {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      try {
        if (this.audio.duration && isFinite(this.audio.duration)) {
          navigator.mediaSession.setPositionState({
            duration: this.audio.duration,
            playbackRate: this.audio.playbackRate,
            position: this.audio.currentTime,
          });
        }
      } catch (e) {
        // Ignored
      }
    }
  }

  // Extract vibrant dominant colors from album art for Apple Music's Dynamic Fluid Mesh Gradient
  extractAlbumColors(coverUrl: string): Promise<DominantColors> {
    return new Promise((resolve) => {
      const defaultColors: DominantColors = {
        primary: '#FC3C44',
        secondary: '#861657',
        accent: '#FA233B',
        ambient: 'rgba(252, 60, 68, 0.4)'
      };

      if (!coverUrl) {
        resolve(defaultColors);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = coverUrl;

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 16;
          canvas.height = 16;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(defaultColors);
            return;
          }

          ctx.drawImage(img, 0, 0, 16, 16);
          const data = ctx.getImageData(0, 0, 16, 16).data;

          let rTotal = 0, gTotal = 0, bTotal = 0, count = 0;
          let rTop = 0, gTop = 0, bTop = 0;
          let rBottom = 0, gBottom = 0, bBottom = 0;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            rTotal += r;
            gTotal += g;
            bTotal += b;
            count++;

            // Sample top half vs bottom half
            if (i < data.length / 2) {
              rTop += r; gTop += g; bTop += b;
            } else {
              rBottom += r; gBottom += g; bBottom += b;
            }
          }

          const half = count / 2;
          const primary = `rgb(${Math.round(rTop / half)}, ${Math.round(gTop / half)}, ${Math.round(bTop / half)})`;
          const secondary = `rgb(${Math.round(rBottom / half)}, ${Math.round(gBottom / half)}, ${Math.round(bBottom / half)})`;
          const avgR = Math.round(rTotal / count);
          const avgG = Math.round(gTotal / count);
          const avgB = Math.round(bTotal / count);

          resolve({
            primary,
            secondary,
            accent: `rgb(${Math.min(255, avgR + 40)}, ${Math.min(255, avgG + 30)}, ${Math.min(255, avgB + 30)})`,
            ambient: `rgba(${avgR}, ${avgG}, ${avgB}, 0.5)`
          });
        } catch {
          resolve(defaultColors);
        }
      };

      img.onerror = () => resolve(defaultColors);
    });
  }
}

export const audioService = new AudioService();
