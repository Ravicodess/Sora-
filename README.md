# 🎵 Masti Music — Apple Music Android Edition

> **A 1:1 Pixel-Perfect Clone of Apple Music UI/UX designed exclusively for playing local device music on Android.**

Built by deconstructing and reverse engineering Apple Music's design tokens, micro-interactions, layout components, and dynamic background shaders.

---

## ✨ Features & Apple Music Reverse-Engineered UI/UX

### 1. Iconic 5-Tab Navigation Bar
- **Listen Now**: Editorial Top Picks carousel, Heavy Rotation grid, and Recently Played favorites.
- **Browse**: Daily Top 100 Charts, New Releases, Moods & Activities (Chill, Gym, Focus, Night Drive).
- **Radio**: Apple Music 1 Live broadcast simulation (featuring Zane Lowe with live animated audio equalizer bars), Apple Music Hits, and Masti Desi Beats.
- **Library**: Playlists, Artists, Albums, Songs, and Downloaded/Local folders with classic Apple disclosure navigation (`>`) and a 2-column "Recently Added" grid.
- **Search**: Apple Search bar with instant real-time search across songs, artists, albums, and genres, paired with colorful Apple 2-column genre discovery tiles.

### 2. Signature Full-Screen "Now Playing" Modal
- **Dynamic Fluid Mesh Gradient**: Fluid animated multi-orb mesh gradient that extracts dominant colors from the current album art in real-time, morphing gently in the background.
- **Squircle Album Artwork**: Smooth continuous corner squircle with realistic drop shadow that scales down by 8% when paused and blooms up when playing.
- **Apple Lossless / Spatial Audio Badges**: High-fidelity indicator chips displaying audio format and resolution (`Lossless 24-bit/48kHz ALAC`, `Dolby Atmos`, `Apple Digital Master`).
- **Time-Synced Glowing Karaoke Lyrics**: Real-time auto-scrolling lyrics with the active line glowing in white while inactive lines stay subtly blurred; tap any line to seek immediately!
- **Up Next / Queue Management**: Reorderable upcoming tracks, single-tap remove, and infinite Autoplay (`∞`).
- **Audio Output Route (AirPlay)**: Selector sheet for Phone Speaker, Bluetooth Headphones, and External Smart Speakers.

### 3. Local Device Music Storage Engine
- **Directory & File Scanner**: Scans Android storage (`/Music`, `/Download`, SD card) via Folder Picker or Multi-File Selector.
- **Supported Formats**: `.mp3`, `.m4a`, `.flac`, `.wav`, `.aac`, `.ogg`, `.opus`.
- **ID3 Metadata Extraction**: Reads Title, Artist, Album, Year, and embedded album covers (APIC frames).
- **Dynamic Cover Art Generator**: Automatically renders Apple-style gradient artwork with artist initials if no cover art is embedded.
- **Persistent Local Database**: Uses IndexedDB to store songs, custom playlists, favorite hearts, and play counts offline.
- **Android MediaSession API**: Full lock screen controls, notification center playback widget, and Bluetooth car/headphone hardware button controls.

---

## 🚀 Quick Start & Live Testing

The application is already compiled and running locally:

```bash
# Access live in any browser or mobile device on the local network
http://localhost:5173
```

To run in development mode with hot-reloading:
```bash
npm run dev
```

---

## 📱 Building the Android APK

### Option A: Direct Progressive Android App (PWA)
1. Open Chrome on your Android device and navigate to your PC's local IP (e.g. `http://192.168.1.X:5173`).
2. Tap the Chrome three-dots menu **⋮** and select **"Install app"** or **"Add to Home screen"**.
3. The app installs as a standalone, fullscreen native Android app with the Apple Music icon and offline storage.

### Option B: Android Studio Native Project
The workspace includes a complete native Android project located in `./android`:
1. Open **Android Studio**.
2. Select **Open an Existing Project** and choose the `android` folder in this workspace.
3. Gradle will sync all dependencies (`Media3 ExoPlayer`, `Jetpack Compose`, `AndroidX WebKit`).
4. Select **Build > Build Bundle(s) / APK(s) > Build APK(s)** to generate your release `.apk`!

### Option C: Capacitor Build
```bash
npx cap add android
npx cap sync android
npx cap open android
```

---

## 📂 Project Architecture

```
Masti Music/
├── src/
│   ├── types/
│   │   └── music.ts             # Core Song, Playlist, Album, and Player types
│   ├── services/
│   │   ├── audioService.ts      # HTML5 Audio & MediaSession API controller
│   │   ├── tagParser.ts         # ID3 metadata & APIC album cover extractor
│   │   ├── storageService.ts    # IndexedDB persistent local storage engine
│   │   └── mockData.ts          # Apple Music sample catalog & radio stations
│   ├── components/
│   │   ├── Navbar.tsx           # Apple Music 5-tab bottom navigation
│   │   ├── MiniPlayer.tsx       # Floating frosted-glass mini-player with scrub line
│   │   ├── NowPlayingModal.tsx  # Dynamic fluid mesh gradient player modal
│   │   ├── SyncedLyrics.tsx     # Real-time animated glowing lyrics
│   │   ├── QueueDrawer.tsx      # Up Next queue list & autoplay switch
│   │   ├── AirPlayModal.tsx     # Audio route output selector sheet
│   │   ├── SongRow.tsx          # Standard Apple track row with ⋯ options
│   │   ├── AlbumCard.tsx        # Squircle cards & editorial hero banners
│   │   └── ImportModal.tsx      # Device storage folder/file scanner
│   ├── views/
│   │   ├── ListenNowView.tsx    # Listen Now feed with Top Picks
│   │   ├── BrowseView.tsx       # Browse charts, releases, and moods
│   │   ├── RadioView.tsx        # Apple Music 1 live broadcast & stations
│   │   ├── LibraryView.tsx      # Playlists, Artists, Albums, and Songs
│   │   └── SearchView.tsx       # Instant search & category tiles
│   ├── styles/
│   │   └── index.css            # Apple glassmorphism & fluid animation tokens
│   ├── App.tsx                  # Global state, router, and audio synchronization
│   └── main.tsx                 # App mount
├── android/                     # Complete Android Studio Native Project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml # Storage & MediaSession permissions
│   │   │   ├── assets/dist/        # Bundled offline application build
│   │   │   └── java/com/masti/music/
│   │   │       ├── MainActivity.kt # Edge-to-edge translucent Android activity
│   │   │       └── PlaybackService.kt # Media3 background playback service
│   │   └── build.gradle
│   ├── build.gradle
│   └── settings.gradle
├── public/
│   ├── apple-music-icon.svg     # Apple Music vector squircle icon
│   └── manifest.json            # Android standalone PWA manifest
└── capacitor.config.json        # Capacitor Android configuration
```
