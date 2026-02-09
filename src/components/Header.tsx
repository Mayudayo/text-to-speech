import { useState } from 'react';
import type { TextBlock } from '../types.ts';
import { pcmToMp3Async, sanitizeFilename } from '../utils/audioUtils.ts';
import VoiceSelector from './VoiceSelector.tsx';
import Spinner from './Spinner.tsx';
import { GenerateIcon, ZipIcon } from './icons/Icons.tsx';
import JSZip from 'jszip';
import { triggerDownload } from '../utils/audioUtils.ts';

interface Props {
  globalVoice: string;
  onGlobalVoiceChange: (voice: string) => void;
  blocks: TextBlock[];
  isBatchRunning: boolean;
  batchProgress: { done: number; total: number };
  onBatchGenerate: () => void;
}

const Header = ({
  globalVoice,
  onGlobalVoiceChange,
  blocks,
  isBatchRunning,
  batchProgress,
  onBatchGenerate,
}: Props) => {
  const [isZipping, setIsZipping] = useState(false);
  const hasAudio = blocks.some(b => b.audioData);
  const hasText = blocks.some(b => b.text.trim());
  const pendingCount = blocks.filter(b => b.text.trim() && !b.audioData).length;

  const audioCount = blocks.filter(b => b.audioData).length;

  const handleZipDownload = async () => {
    if (audioCount === 0) {
      alert('ダウンロードする音声がありません。先に音声を生成してください。');
      return;
    }

    setIsZipping(true);
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const zip = new JSZip();
      let fileCount = 0;

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        if (!block.audioData) continue;

        const mp3Blob = await pcmToMp3Async(block.audioData);
        const name = block.title.trim() || `block_${i + 1}`;
        const filename = `${String(i + 1).padStart(2, '0')}_${sanitizeFilename(name)}_${block.voice}.mp3`;
        zip.file(filename, mp3Blob);
        fileCount++;
      }

      if (fileCount === 0) {
        alert('音声ファイルがZIPに追加されませんでした。');
        return;
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      triggerDownload(blob, 'tts_audio.zip');

    } catch (err) {
      console.error('ZIP download failed:', err);
      alert(`ZIP作成エラー: ${err instanceof Error ? err.message : '不明なエラー'}`);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h1 className="text-xl font-bold text-gray-100 flex-shrink-0">
            Text-to-Speech
          </h1>

          <div className="flex items-center gap-3 flex-wrap flex-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              デフォルト音声:
            </label>
            <VoiceSelector
              value={globalVoice}
              onChange={onGlobalVoiceChange}
            />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onBatchGenerate}
              disabled={isBatchRunning || !hasText || pendingCount === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isBatchRunning ? <Spinner /> : <GenerateIcon />}
              <span>
                {isBatchRunning
                  ? `${batchProgress.done}/${batchProgress.total}`
                  : `一括生成 (${pendingCount})`}
              </span>
            </button>

            <button
              onClick={handleZipDownload}
              disabled={!hasAudio || isZipping}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title={hasAudio ? `${audioCount}件の音声をダウンロード` : '音声を先に生成してください'}
            >
              {isZipping ? <Spinner /> : <ZipIcon />}
              <span>{isZipping ? '作成中...' : `ZIP (${audioCount})`}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
