import test from 'node:test';
import assert from 'node:assert/strict';

// Core domain logic tests for playback state machine and queue
function computeNextTrack({
  isAutoTransition,
  repeatMode,
  currentSongIndex,
  songs,
  queue,
  autoplay,
  isShuffle
}) {
  if (isAutoTransition && repeatMode === 'one') {
    return { action: 'repeat-current', nextIndex: currentSongIndex };
  }

  if (queue.length > 0) {
    const [nextSong, ...remainingQueue] = queue;
    return { action: 'play-queue', nextSong, remainingQueue };
  }

  if (songs.length === 0) {
    return { action: 'stop' };
  }

  if (isAutoTransition && !autoplay) {
    return { action: 'stop' };
  }

  let nextIndex = 0;
  if (isShuffle) {
    if (songs.length > 1) {
      // Pick random distinct index
      let rand;
      do {
        rand = Math.floor(Math.random() * songs.length);
      } while (rand === currentSongIndex);
      nextIndex = rand;
    } else {
      nextIndex = 0;
    }
  } else if (currentSongIndex >= 0 && currentSongIndex < songs.length - 1) {
    nextIndex = currentSongIndex + 1;
  } else if (repeatMode === 'all' || !isAutoTransition) {
    nextIndex = 0; // Wrap around to start
  } else {
    return { action: 'stop' };
  }

  return { action: 'play-song', nextSong: songs[nextIndex], nextIndex };
}

function clampVolume(vol) {
  return Math.max(0, Math.min(1, vol));
}

test('Playback Engine - Repeat Mode "one" on auto-transition repeats current song', () => {
  const result = computeNextTrack({
    isAutoTransition: true,
    repeatMode: 'one',
    currentSongIndex: 2,
    songs: [{ id: '1' }, { id: '2' }, { id: '3' }],
    queue: [],
    autoplay: true,
    isShuffle: false
  });

  assert.equal(result.action, 'repeat-current');
  assert.equal(result.nextIndex, 2);
});

test('Playback Engine - Explicit user skip advances track even when Repeat Mode is "one"', () => {
  const result = computeNextTrack({
    isAutoTransition: false, // User clicked Next
    repeatMode: 'one',
    currentSongIndex: 0,
    songs: [{ id: '1' }, { id: '2' }, { id: '3' }],
    queue: [],
    autoplay: true,
    isShuffle: false
  });

  assert.equal(result.action, 'play-song');
  assert.equal(result.nextIndex, 1);
});

test('Playback Engine - Queue has priority over playlist order', () => {
  const queuedSong = { id: 'queued-99', title: 'Special Track' };
  const result = computeNextTrack({
    isAutoTransition: true,
    repeatMode: 'off',
    currentSongIndex: 0,
    songs: [{ id: '1' }, { id: '2' }],
    queue: [queuedSong],
    autoplay: true,
    isShuffle: false
  });

  assert.equal(result.action, 'play-queue');
  assert.equal(result.nextSong.id, 'queued-99');
  assert.equal(result.remainingQueue.length, 0);
});

test('Playback Engine - Autoplay disabled halts auto-transition at track end', () => {
  const result = computeNextTrack({
    isAutoTransition: true,
    repeatMode: 'off',
    currentSongIndex: 0,
    songs: [{ id: '1' }, { id: '2' }],
    queue: [],
    autoplay: false,
    isShuffle: false
  });

  assert.equal(result.action, 'stop');
});

test('Playback Engine - User click advances even when Autoplay is disabled', () => {
  const result = computeNextTrack({
    isAutoTransition: false, // User pressed Next
    repeatMode: 'off',
    currentSongIndex: 0,
    songs: [{ id: '1' }, { id: '2' }],
    queue: [],
    autoplay: false,
    isShuffle: false
  });

  assert.equal(result.action, 'play-song');
  assert.equal(result.nextIndex, 1);
});

test('Playback Engine - Repeat "all" wraps around to first track at playlist end', () => {
  const result = computeNextTrack({
    isAutoTransition: true,
    repeatMode: 'all',
    currentSongIndex: 2,
    songs: [{ id: '1' }, { id: '2' }, { id: '3' }],
    queue: [],
    autoplay: true,
    isShuffle: false
  });

  assert.equal(result.action, 'play-song');
  assert.equal(result.nextIndex, 0);
});

test('Playback Engine - Volume Clamping between 0.0 and 1.0', () => {
  assert.equal(clampVolume(-0.5), 0);
  assert.equal(clampVolume(1.8), 1);
  assert.equal(clampVolume(0.75), 0.75);
  assert.equal(clampVolume(0), 0);
  assert.equal(clampVolume(1), 1);
});
