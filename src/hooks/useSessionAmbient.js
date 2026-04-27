import { useEffect, useRef } from 'react';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { SESSION_AUDIO_SOURCE } from '../constants/sessionMedia';

const FADE_IN_MS = 4500;
const FADE_OUT_MS = 9000;
const TARGET_VOLUME = 0.34;

function computeVolume(wallMs, totalDurationMs) {
  const fadeIn = Math.min(1, wallMs / FADE_IN_MS);
  const fadeOutStart = Math.max(0, totalDurationMs - FADE_OUT_MS);
  let fadeOut = 1;
  if (wallMs > fadeOutStart && totalDurationMs > 0) {
    fadeOut = Math.max(0, 1 - (wallMs - fadeOutStart) / FADE_OUT_MS);
  }
  return TARGET_VOLUME * fadeIn * fadeOut;
}

/**
 * Looped session music with fade-in at start and fade-out before session end.
 * `source` — expo-audio asset (`require(...)`) or URL; defaults to cosmic session BGM.
 */
export function useSessionAmbient({ enabled, totalDurationMs, wallMs, source = SESSION_AUDIO_SOURCE }) {
  const player = useAudioPlayer(source, {
    updateInterval: 250,
  });
  const status = useAudioPlayerStatus(player);
  const didStartRef = useRef(false);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!enabled) {
      try {
        player.pause();
      } catch (_) {}
      didStartRef.current = false;
      return;
    }

    if (!status.isLoaded) return;

    try {
      player.loop = true;
      player.volume = computeVolume(wallMs, totalDurationMs);
      if (!didStartRef.current) {
        player.play();
        didStartRef.current = true;
      }
    } catch (_) {}
  }, [enabled, wallMs, totalDurationMs, player, status.isLoaded]);
}
