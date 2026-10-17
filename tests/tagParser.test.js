import test from 'node:test';
import assert from 'node:assert/strict';

// Helper matching parseFromFilename logic
function parseFromFilename(fileName) {
  const cleanName = fileName.replace(/\.[^/.]+$/, '').trim();

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

test('parseFromFilename - standard "Artist - Title.mp3"', () => {
  const result = parseFromFilename('Daft Punk - Get Lucky.mp3');
  assert.equal(result.artist, 'Daft Punk');
  assert.equal(result.title, 'Get Lucky');
  assert.equal(result.album, 'Local Music');
});

test('parseFromFilename - numbered track "01 - The Weeknd - Blinding Lights.flac"', () => {
  const result = parseFromFilename('01 - The Weeknd - Blinding Lights.flac');
  assert.equal(result.artist, 'The Weeknd');
  assert.equal(result.title, 'Blinding Lights');
  assert.equal(result.album, 'Local Music');
});

test('parseFromFilename - multi-dash title "Pink Floyd - Time - 2011 Remaster.m4a"', () => {
  const result = parseFromFilename('Pink Floyd - Time - 2011 Remaster.m4a');
  assert.equal(result.artist, 'Pink Floyd');
  assert.equal(result.title, 'Time - 2011 Remaster');
});

test('parseFromFilename - filename without dash fallback', () => {
  const result = parseFromFilename('StairwayToHeaven.wav');
  assert.equal(result.artist, 'Unknown Artist');
  assert.equal(result.title, 'StairwayToHeaven');
  assert.equal(result.album, 'Local Music');
});

test('parseFromFilename - handles trimmed spaces and dots in filename', () => {
  const result = parseFromFilename('  Coldplay   -   Viva La Vida (Live).opus  ');
  assert.equal(result.artist, 'Coldplay');
  assert.equal(result.title, 'Viva La Vida (Live)');
});
