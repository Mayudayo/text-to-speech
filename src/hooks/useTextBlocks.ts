import { useReducer, useCallback } from 'react';
import type { TextBlock, BlockStatus } from '../types.ts';

type Action =
  | { type: 'ADD_BLOCK'; defaultVoice: string }
  | { type: 'DELETE_BLOCK'; id: string }
  | { type: 'UPDATE_TITLE'; id: string; title: string }
  | { type: 'UPDATE_TEXT'; id: string; text: string }
  | { type: 'UPDATE_VOICE'; id: string; voice: string }
  | { type: 'SET_STATUS'; id: string; status: BlockStatus; error?: string }
  | { type: 'SET_AUDIO'; id: string; audioData: string };

let nextId = 1;
function generateId(): string {
  return `block-${nextId++}`;
}

function createBlock(defaultVoice: string): TextBlock {
  return {
    id: generateId(),
    title: '',
    text: '',
    voice: defaultVoice,
    status: 'idle',
    audioData: null,
    error: null,
  };
}

function reducer(state: TextBlock[], action: Action): TextBlock[] {
  switch (action.type) {
    case 'ADD_BLOCK':
      return [...state, createBlock(action.defaultVoice)];
    case 'DELETE_BLOCK':
      return state.filter(b => b.id !== action.id);
    case 'UPDATE_TITLE':
      return state.map(b =>
        b.id === action.id ? { ...b, title: action.title } : b,
      );
    case 'UPDATE_TEXT':
      return state.map(b =>
        b.id === action.id
          ? { ...b, text: action.text, audioData: null, status: 'idle', error: null }
          : b,
      );
    case 'UPDATE_VOICE':
      return state.map(b =>
        b.id === action.id
          ? { ...b, voice: action.voice, audioData: null, status: 'idle', error: null }
          : b,
      );
    case 'SET_STATUS':
      return state.map(b =>
        b.id === action.id
          ? { ...b, status: action.status, error: action.error ?? null }
          : b,
      );
    case 'SET_AUDIO':
      return state.map(b =>
        b.id === action.id
          ? { ...b, audioData: action.audioData, status: 'done', error: null }
          : b,
      );
    default:
      return state;
  }
}

export function useTextBlocks(defaultVoice: string) {
  const [blocks, dispatch] = useReducer(reducer, [createBlock(defaultVoice)]);

  const addBlock = useCallback(
    () => dispatch({ type: 'ADD_BLOCK', defaultVoice }),
    [defaultVoice],
  );
  const deleteBlock = useCallback(
    (id: string) => dispatch({ type: 'DELETE_BLOCK', id }),
    [],
  );
  const updateTitle = useCallback(
    (id: string, title: string) => dispatch({ type: 'UPDATE_TITLE', id, title }),
    [],
  );
  const updateText = useCallback(
    (id: string, text: string) => dispatch({ type: 'UPDATE_TEXT', id, text }),
    [],
  );
  const updateVoice = useCallback(
    (id: string, voice: string) => dispatch({ type: 'UPDATE_VOICE', id, voice }),
    [],
  );
  const setStatus = useCallback(
    (id: string, status: BlockStatus, error?: string) =>
      dispatch({ type: 'SET_STATUS', id, status, error }),
    [],
  );
  const setAudio = useCallback(
    (id: string, audioData: string) => dispatch({ type: 'SET_AUDIO', id, audioData }),
    [],
  );

  return {
    blocks,
    addBlock,
    deleteBlock,
    updateTitle,
    updateText,
    updateVoice,
    setStatus,
    setAudio,
  };
}
