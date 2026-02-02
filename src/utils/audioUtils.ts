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

export const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
};

export const sanitizeFilename = (name: string): string => {
  return name.replace(/[\/\\:*?"<>|]/g, '_').replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
};
