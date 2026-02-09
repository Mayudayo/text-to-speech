import { useCallback, useState } from 'react';
import type { TextBlock as TextBlockType } from '../types.ts';
import { generateAudioFromText } from '../services/ttsService.ts';
import { pcmToMp3Async, triggerDownload, sanitizeFilename } from '../utils/audioUtils.ts';
import VoiceSelector from './VoiceSelector.tsx';
import Spinner from './Spinner.tsx';
import {
  GenerateIcon,
  PlayIcon,
  StopIcon,
  DownloadIcon,
  TrashIcon,
} from './icons/Icons.tsx';

interface Props {
  block: TextBlockType;
  index: number;
  isPlaying: boolean;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onUpdateVoice: (id: string, voice: string) => void;
  onSetStatus: (id: string, status: TextBlockType['status'], error?: string) => void;
  onSetAudio: (id: string, audioData: string) => void;
  onDelete: (id: string) => void;
  onTogglePlay: (blockId: string, audioData: string) => Promise<void>;
}

const TextBlock = ({
  block,
  index,
  isPlaying,
  onUpdateTitle,
  onUpdateText,
  onUpdateVoice,
  onSetStatus,
  onSetAudio,
  onDelete,
  onTogglePlay,
}: Props) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!block.text.trim()) return;
    onSetStatus(block.id, 'generating');
    try {
      const audioData = await generateAudioFromText(block.text, block.voice);
      onSetAudio(block.id, audioData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '音声生成に失敗しました。';
      onSetStatus(block.id, 'error', msg);
    }
  }, [block.id, block.text, block.voice, onSetStatus, onSetAudio]);

  const handleDownload = useCallback(async () => {
    if (!block.audioData) return;

    setIsDownloading(true);
    await new Promise(resolve => setTimeout(resolve, 10));

    try {
      const mp3Blob = await pcmToMp3Async(block.audioData);
      const name = block.title.trim() || `block_${index + 1}`;
      const filename = `${sanitizeFilename(name)}_${block.voice}.mp3`;
      triggerDownload(mp3Blob, filename);
    } catch (err) {
      console.error('Download failed:', err);
      alert(`ダウンロードエラー: ${err instanceof Error ? err.message : '不明なエラー'}`);
    } finally {
      setIsDownloading(false);
    }
  }, [block.audioData, block.title, block.voice, index]);

  const isGenerating = block.status === 'generating';

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center gap-3">
        <span className="bg-gray-700 px-2 py-0.5 rounded text-xs font-bold text-cyan-400 flex-shrink-0">
          #{index + 1}
        </span>
        <input
          type="text"
          placeholder="タイトル (任意 - ファイル名に使用)"
          value={block.title}
          onChange={e => onUpdateTitle(block.id, e.target.value)}
          className="flex-1 bg-transparent border-b border-gray-700 text-gray-200 text-sm py-1 px-1 focus:border-cyan-500 focus:outline-none placeholder-gray-600"
        />
        <button
          onClick={() => onDelete(block.id)}
          className="p-1.5 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
          aria-label="ブロックを削除"
          title="ブロックを削除"
        >
          <TrashIcon />
        </button>
      </div>

      {/* Text area */}
      <textarea
        placeholder="音声に変換するテキストを入力..."
        value={block.text}
        onChange={e => onUpdateText(block.id, e.target.value)}
        rows={4}
        className="w-full bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 text-sm p-3 resize-y focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none placeholder-gray-600"
      />

      {/* Controls row */}
      <div className="flex items-center gap-3 flex-wrap">
        <VoiceSelector
          value={block.voice}
          onChange={v => onUpdateVoice(block.id, v)}
        />

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !block.text.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? <Spinner /> : <GenerateIcon />}
          <span>{isGenerating ? '生成中...' : '音声生成'}</span>
        </button>

        {block.audioData && (
          <>
            <button
              onClick={() => onTogglePlay(block.id, block.audioData!)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isPlaying
                  ? 'bg-orange-600 text-white hover:bg-orange-500'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
            >
              {isPlaying ? <StopIcon /> : <PlayIcon />}
              <span>{isPlaying ? '停止' : '再生'}</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-40 transition-colors"
            >
              {isDownloading ? <Spinner /> : <DownloadIcon />}
              <span>MP3</span>
            </button>
          </>
        )}

        {/* Status indicators */}
        <div className="ml-auto flex items-center gap-2">
          {block.status === 'done' && (
            <span className="text-xs text-green-400">生成済み</span>
          )}
        </div>
      </div>

      {/* Error display */}
      {block.error && (
        <div className="text-xs text-red-400 bg-red-900/10 p-2 rounded border border-red-500/20">
          {block.error}
        </div>
      )}
    </div>
  );
};

export default TextBlock;
