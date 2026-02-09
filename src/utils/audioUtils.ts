declare const lamejs: any;

const base64ToUint8Array = (base64String: string): Uint8Array => {
  const binaryString = window.atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// 同期版（後方互換性のため残す）
export const pcmToMp3 = (base64PcmData: string): Blob => {
  const SAMPLE_RATE = 24000;
  const CHANNELS = 1;
  const KBPS = 128;

  const pcmBytes = base64ToUint8Array(base64PcmData);
  const pcmSamples = new Int16Array(pcmBytes.buffer);

  if (typeof lamejs === 'undefined') {
    throw new Error('lamejsライブラリが読み込まれていません。');
  }
  const mp3encoder = new lamejs.Mp3Encoder(CHANNELS, SAMPLE_RATE, KBPS);
  const mp3Data: Int8Array[] = [];
  const sampleBlockSize = 1152;

  for (let i = 0; i < pcmSamples.length; i += sampleBlockSize) {
    const sampleChunk = pcmSamples.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
  }

  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
  }

  return new Blob(mp3Data, { type: 'audio/mpeg' });
};

// 非同期版（UIフリーズ防止）
export const pcmToMp3Async = async (base64PcmData: string): Promise<Blob> => {
  if (!base64PcmData) {
    throw new Error('音声データが空です');
  }

  const SAMPLE_RATE = 24000;
  const CHANNELS = 1;
  const KBPS = 128;

  const pcmBytes = base64ToUint8Array(base64PcmData);
  if (pcmBytes.length === 0) {
    throw new Error('PCMデータが空です');
  }

  // バイト長が偶数であることを確認（Int16Array用）
  const alignedLength = pcmBytes.length - (pcmBytes.length % 2);

  // 新しいArrayBufferにコピーしてアラインメントを保証
  const alignedBuffer = new ArrayBuffer(alignedLength);
  const alignedView = new Uint8Array(alignedBuffer);
  alignedView.set(pcmBytes.subarray(0, alignedLength));

  const pcmSamples = new Int16Array(alignedBuffer);
  if (pcmSamples.length === 0) {
    throw new Error('PCMサンプルが空です');
  }

  if (typeof lamejs === 'undefined') {
    throw new Error('lamejsライブラリが読み込まれていません。');
  }

  const mp3encoder = new lamejs.Mp3Encoder(CHANNELS, SAMPLE_RATE, KBPS);
  const mp3Data: Int8Array[] = [];
  const sampleBlockSize = 1152;
  const YIELD_INTERVAL = 50;

  for (let i = 0; i < pcmSamples.length; i += sampleBlockSize) {
    const sampleChunk = pcmSamples.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
    if ((i / sampleBlockSize) % YIELD_INTERVAL === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
  }

  const blob = new Blob(mp3Data, { type: 'audio/mpeg' });
  if (blob.size === 0) {
    throw new Error('MP3変換結果が空です');
  }

  return blob;
};

export const triggerDownload = (blob: Blob, filename: string) => {
  if (blob.size === 0) {
    throw new Error('ダウンロードするデータが空です');
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

export const sanitizeFilename = (name: string): string => {
  return name.replace(/[\/\\:*?"<>|]/g, '_').replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
};
