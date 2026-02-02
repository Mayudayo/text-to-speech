import type { TextBlock } from '../types.ts';
import { pcmToMp3, sanitizeFilename } from '../utils/audioUtils.ts';
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
  const hasAudio = blocks.some(b => b.audioData);
  const hasText = blocks.some(b => b.text.trim());
  const pendingCount = blocks.filter(b => b.text.trim() && !b.audioData).length;

  const handleZipDownload = async () => {
    const zip = new JSZip();
    blocks.forEach((block, i) => {
      if (!block.audioData) return;
      const mp3Blob = pcmToMp3(block.audioData);
      const name = block.title.trim() || `block_${i + 1}`;
      const filename = `${String(i + 1).padStart(2, '0')}_${sanitizeFilename(name)}_${block.voice}.mp3`;
      zip.file(filename, mp3Blob);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    triggerDownload(blob, 'tts_audio.zip');
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
              disabled={!hasAudio}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ZipIcon />
              <span>ZIP</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
