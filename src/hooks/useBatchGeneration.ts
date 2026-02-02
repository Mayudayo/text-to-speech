import { useState, useCallback } from 'react';
import type { TextBlock, BlockStatus } from '../types.ts';
import { generateAudioFromText } from '../services/ttsService.ts';

interface BatchCallbacks {
  setStatus: (id: string, status: BlockStatus, error?: string) => void;
  setAudio: (id: string, audioData: string) => void;
}

export function useBatchGeneration(callbacks: BatchCallbacks) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const generate = useCallback(
    async (blocks: TextBlock[]) => {
      const targets = blocks.filter(b => b.text.trim() && !b.audioData);
      if (targets.length === 0) return;

      setIsRunning(true);
      setProgress({ done: 0, total: targets.length });

      for (let i = 0; i < targets.length; i++) {
        const block = targets[i];
        callbacks.setStatus(block.id, 'generating');
        try {
          const audioData = await generateAudioFromText(block.text, block.voice);
          callbacks.setAudio(block.id, audioData);
        } catch (err) {
          const msg = err instanceof Error ? err.message : '音声生成に失敗しました。';
          callbacks.setStatus(block.id, 'error', msg);
        }
        setProgress({ done: i + 1, total: targets.length });
      }

      setIsRunning(false);
    },
    [callbacks],
  );

  return { isRunning, progress, generate };
}
