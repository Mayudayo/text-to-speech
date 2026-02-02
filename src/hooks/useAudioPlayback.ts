import { useRef, useState, useCallback } from 'react';
import { decodeBase64, decodeAudioData } from '../utils/audioPlayback.ts';

export function useAudioPlayback() {
  const [playingBlockId, setPlayingBlockId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stop = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    setPlayingBlockId(null);
  }, []);

  const play = useCallback(
    async (blockId: string, base64Audio: string) => {
      stop();

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      await ctx.resume();

      const bytes = decodeBase64(base64Audio);
      const buffer = await decodeAudioData(bytes, ctx, 24000, 1);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => {
        setPlayingBlockId(null);
        sourceRef.current = null;
      };
      source.start(0);

      sourceRef.current = source;
      setPlayingBlockId(blockId);
    },
    [stop],
  );

  const toggle = useCallback(
    async (blockId: string, base64Audio: string) => {
      if (playingBlockId === blockId) {
        stop();
      } else {
        await play(blockId, base64Audio);
      }
    },
    [playingBlockId, play, stop],
  );

  return { playingBlockId, play, stop, toggle };
}
