# 🎵 Sora — Apple Music for Android

> **A 1:1 Pixel-Perfect Clone of Apple Music UI/UX designed exclusively for local device music playback on Android with fluid spring physics.**

---

## 📱 Download Ready: `Sora.apk`

A signed Android package has been generated and is ready to install:

* **File**: [`Sora.apk`](file:///c:/Users/ravip/Downloads/Masti%20Music/Sora.apk) (2.75 MB)
* **Installation via ADB**:
  ```bash
  adb install Sora.apk
  ```
* **Installation via USB / Phone Storage**:
  1. Transfer `Sora.apk` to your Android device via USB or local network.
  2. Tap the APK file in your phone's File Manager / Downloads to install.

---

## ✨ What's New in Sora

1. **Pure Local Music — Zero Dummy Data**:
   - All mock tracks have been removed.
   - Starts with a clean, elegant Apple-style library onboarding.
   - Built-in folder and multi-file storage scanner indexes your local `.mp3`, `.m4a`, `.flac`, `.wav`, `.aac`, and `.ogg` files into a persistent IndexedDB database.

2. **Apple Fluid Spring Physics & Smoother Animations**:
   - **Now Playing Sheet**: Fluid spring entrance curve (`cubic-bezier(0.16, 1, 0.3, 1)`) matching iOS 17/18.
   - **Dynamic Ambient Color Mesh**: Continuous, dreamy drifting blur orbs sampling dominant colors from your album art in real-time.
   - **Squircle Album Micro-Interaction**: Artwork scales down by 10% when paused and smoothly blooms up on play with realistic bounce physics.
   - **Time-Synced Karaoke Lyrics**: Silky smooth auto-scroll with active line glowing in white while background lines remain softly blurred.
   - **Mini-Player**: Spring-loaded bottom dock with live audio scrub line and touch feedback (`active:scale-[0.98]`).

3. **Optimized Performance**:
   - Lightweight standalone package under 3 MB.
   - Instant cold-boot with offline `WebViewAssetLoader` loading.
   - Android `MediaSession` integration for lock-screen controls, notification bar widgets, and Bluetooth car/headset controls.

---

## 🌐 Live Web Preview

Run locally or preview on your device:
* **Localhost**: [http://localhost:5173](http://localhost:5173)
* **Android Wi-Fi**: `http://192.168.31.152:5173`

To build the APK again anytime:
```bash
python build_apk.py
```
