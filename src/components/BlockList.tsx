import type { TextBlock as TextBlockType, BlockStatus } from '../types.ts';
import TextBlock from './TextBlock.tsx';
import { PlusIcon } from './icons/Icons.tsx';

interface Props {
  blocks: TextBlockType[];
  playingBlockId: string | null;
  onAddBlock: () => void;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onUpdateVoice: (id: string, voice: string) => void;
  onSetStatus: (id: string, status: BlockStatus, error?: string) => void;
  onSetAudio: (id: string, audioData: string) => void;
  onDelete: (id: string) => void;
  onTogglePlay: (blockId: string, audioData: string) => Promise<void>;
}

const BlockList = ({
  blocks,
  playingBlockId,
  onAddBlock,
  onUpdateTitle,
  onUpdateText,
  onUpdateVoice,
  onSetStatus,
  onSetAudio,
  onDelete,
  onTogglePlay,
}: Props) => (
  <div className="space-y-4">
    {blocks.map((block, i) => (
      <TextBlock
        key={block.id}
        block={block}
        index={i}
        isPlaying={playingBlockId === block.id}
        onUpdateTitle={onUpdateTitle}
        onUpdateText={onUpdateText}
        onUpdateVoice={onUpdateVoice}
        onSetStatus={onSetStatus}
        onSetAudio={onSetAudio}
        onDelete={onDelete}
        onTogglePlay={onTogglePlay}
      />
    ))}
    <button
      onClick={onAddBlock}
      className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:border-cyan-600 hover:text-cyan-400 transition-colors"
    >
      <PlusIcon />
      <span className="text-sm font-medium">ブロックを追加</span>
    </button>
  </div>
);

export default BlockList;
