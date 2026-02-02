export type BlockStatus = 'idle' | 'generating' | 'done' | 'error';

export interface TextBlock {
  id: string;
  title: string;
  text: string;
  voice: string;
  status: BlockStatus;
  audioData: string | null;
  error: string | null;
}
