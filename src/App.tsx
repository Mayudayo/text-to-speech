import { useState, useCallback, useMemo } from 'react';
import { useTextBlocks } from './hooks/useTextBlocks.ts';
import { useAudioPlayback } from './hooks/useAudioPlayback.ts';
import { useBatchGeneration } from './hooks/useBatchGeneration.ts';
import Header from './components/Header.tsx';
import BlockList from './components/BlockList.tsx';

const DEFAULT_VOICE = 'Kore';

export default function App() {
  const [globalVoice, setGlobalVoice] = useState(DEFAULT_VOICE);
  const {
    blocks,
    addBlock,
    deleteBlock,
    updateTitle,
    updateText,
    updateVoice,
    setStatus,
    setAudio,
  } = useTextBlocks(globalVoice);

  const { playingBlockId, toggle } = useAudioPlayback();

  const batchCallbacks = useMemo(
    () => ({ setStatus, setAudio }),
    [setStatus, setAudio],
  );
  const { isRunning, progress, generate } = useBatchGeneration(batchCallbacks);

  const handleBatchGenerate = useCallback(() => {
    generate(blocks);
  }, [generate, blocks]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        globalVoice={globalVoice}
        onGlobalVoiceChange={setGlobalVoice}
        blocks={blocks}
        isBatchRunning={isRunning}
        batchProgress={progress}
        onBatchGenerate={handleBatchGenerate}
      />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <BlockList
          blocks={blocks}
          playingBlockId={playingBlockId}
          onAddBlock={addBlock}
          onUpdateTitle={updateTitle}
          onUpdateText={updateText}
          onUpdateVoice={updateVoice}
          onSetStatus={setStatus}
          onSetAudio={setAudio}
          onDelete={deleteBlock}
          onTogglePlay={toggle}
        />
      </main>
    </div>
  );
}
