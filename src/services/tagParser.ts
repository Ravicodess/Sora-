import { Song } from '../types/music';

// Generate vibrant Apple Music style gradient placeholder with title initial
export function generateCoverArt(title: string, artist: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Palette sets inspired by Apple Music genre gradients
  const gradients = [
    ['#FC3C44', '#F94892', '#861657'],
    ['#667eea', '#764ba2', '#3B2667'],
    ['#ff0844', '#ffb199', '#bc204b'],
    ['#4facfe', '#00f2fe', '#0b4074'],
    ['#f093fb', '#f5576c', '#791d39'],
    ['#43e97b', '#38f9d7', '#0e5f4c'],
    ['#fa709a', '#fee140', '#9c1c46'],
    ['#a18cd1', '#fbc2eb', '#452a6f'],
  ];

  // Hash based on song title
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = gradients[Math.abs(hash) % gradients.length];

  const grad = ctx.createLinearGradient(0, 0, 500, 500);
  grad.addColorStop(0, palette[0]);
  grad.addColorStop(0.5, palette[1]);
  grad.addColorStop(1, palette[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 500, 500);

  // Subtle circular ambient highlight
  const radial = ctx.createRadialGradient(250, 180, 20, 250, 180, 220);
  radial.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
  radial.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, 500, 500);

  // Large initial letter
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 180px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const initial = (title.trim()[0] || 'M').toUpperCase();
  ctx.fillText(initial, 250, 230);

  // Subtitle (artist)
  ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  const artistText = artist.length > 25 ? artist.substring(0, 25) + '...' : artist;
  ctx.fillText(artistText, 250, 360);

  // Lossless badge indicator on artwork
  ctx.font = '700 16px -apple-system, BlinkMacSystemFont, "SF Pro Rounded", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillText('APPLE LOSSLESS', 250, 410);

  return canvas.toDataURL('image/jpeg', 0.85);
}

// Extract duration helper
export function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = url;
    audio.onloadedmetadata = () => {
      resolve(Math.round(audio.duration || 180));
    };
    audio.onerror = () => {
      resolve(180); // default 3 min fallback
    };
  });
}

// Clean filename into Artist & Title
function parseFromFilename(fileName: string): { title: string; artist: string; album: string } {
  const cleanName = fileName.replace(/\.[^/.]+$/, '').trim(); // remove extension

  // Patterns like "01 - Artist - Title" or "Artist - Title"
  const dashParts = cleanName.split(/\s*-\s*/);
  if (dashParts.length >= 2) {
    if (dashParts.length >= 3 && /^\d+$/.test(dashParts[0])) {
      return {
        artist: dashParts[1],
        title: dashParts[2],
        album: 'Local Music'
      };
    }
    return {
      artist: dashParts[0],
      title: dashParts.slice(1).join(' - '),
      album: 'Local Music'
    };
  }

  return {
    artist: 'Unknown Artist',
    title: cleanName,
    album: 'Local Music'
  };
}

// Lightweight ID3 / MP3 / M4A metadata tag parser
export async function parseAudioFile(file: File): Promise<Song> {
  const fileUrl = URL.createObjectURL(file);
  const duration = await getAudioDuration(fileUrl);
  const fallback = parseFromFilename(file.name);

  let title = fallback.title;
  let artist = fallback.artist;
  let album = fallback.album;
  let year: string | number = new Date().getFullYear();
  let coverUrl = '';

  try {
    // Read the first 128KB of the file to check for ID3v2 header
    const headerBuffer = await file.slice(0, 131072).arrayBuffer();
    const data = new Uint8Array(headerBuffer);

    // ID3v2 check: first 3 bytes are "ID3"
    if (data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33) {
      // Parse ID3v2 frames
      let offset = 10; // ID3v2 header is 10 bytes
      const totalSize =
        ((data[6] & 0x7f) << 21) |
        ((data[7] & 0x7f) << 14) |
        ((data[8] & 0x7f) << 7) |
        (data[9] & 0x7f);

      const maxOffset = Math.min(data.length - 10, totalSize);

      while (offset < maxOffset) {
        // Read 4-byte frame ID
        const frameId = String.fromCharCode(
          data[offset],
          data[offset + 1],
          data[offset + 2],
          data[offset + 3]
        );

        if (!frameId.match(/^[A-Z0-9]{4}$/)) break;

        const frameSize =
          (data[offset + 4] << 24) |
          (data[offset + 5] << 16) |
          (data[offset + 6] << 8) |
          data[offset + 7];

        offset += 10;
        if (frameSize <= 0 || offset + frameSize > data.length) break;

        // Extract frame content
        if (frameId === 'TIT2') {
          // Title
          const textData = data.slice(offset + 1, offset + frameSize);
          const decoded = new TextDecoder('utf-8').decode(textData).replace(/\0/g, '').trim();
          if (decoded) title = decoded;
        } else if (frameId === 'TPE1') {
          // Artist
          const textData = data.slice(offset + 1, offset + frameSize);
          const decoded = new TextDecoder('utf-8').decode(textData).replace(/\0/g, '').trim();
          if (decoded) artist = decoded;
        } else if (frameId === 'TALB') {
          // Album
          const textData = data.slice(offset + 1, offset + frameSize);
          const decoded = new TextDecoder('utf-8').decode(textData).replace(/\0/g, '').trim();
          if (decoded) album = decoded;
        } else if (frameId === 'TYER' || frameId === 'TDRC') {
          // Year
          const textData = data.slice(offset + 1, offset + frameSize);
          const decoded = new TextDecoder('utf-8').decode(textData).replace(/\0/g, '').trim();
          if (decoded) year = decoded.substring(0, 4);
        } else if (frameId === 'APIC') {
          // Attached Picture (Album Art)
          try {
            let picOffset = offset + 1; // skip encoding byte
            // find mime type
            let mimeType = 'image/jpeg';
            let mimeEnd = picOffset;
            while (mimeEnd < offset + frameSize && data[mimeEnd] !== 0) {
              mimeEnd++;
            }
            const mime = new TextDecoder().decode(data.slice(picOffset, mimeEnd));
            if (mime.includes('png')) mimeType = 'image/png';
            picOffset = mimeEnd + 1;
            picOffset++; // picture type byte

            // skip description
            while (picOffset < offset + frameSize && data[picOffset] !== 0) {
              picOffset++;
            }
            picOffset++; // skip null terminator

            if (picOffset < offset + frameSize) {
              const imageBytes = data.slice(picOffset, offset + frameSize);
              const blob = new Blob([imageBytes], { type: mimeType });
              coverUrl = URL.createObjectURL(blob);
            }
          } catch (e) {
            console.warn('APIC parsing skipped', e);
          }
        }

        offset += frameSize;
      }
    }
  } catch (err) {
    console.warn('Metadata parsing fallback used', err);
  }

  // If no embedded cover art found, generate Apple Music style artwork!
  if (!coverUrl) {
    coverUrl = generateCoverArt(title, artist);
  }

  return {
    id: 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
    title,
    artist,
    album,
    duration,
    url: fileUrl,
    coverUrl,
    fileBlob: file,
    year,
    format: file.name.split('.').pop()?.toUpperCase() || 'AUDIO',
    bitrate: 'Local Lossless • Sora Audio',
    isLocal: true,
    isFavorite: false,
    playCount: 0,
    addedAt: Date.now(),
    lyrics: [
      { time: 0, text: `♪ Now playing ${title} ♪` },
      { time: 3, text: `Artist: ${artist}` },
      { time: 6, text: `Album: ${album}` },
      { time: 10, text: "Tap lyrics button to toggle karaoke view" },
      { time: 15, text: "Local storage playback in Sora" }
    ]
  };
}
