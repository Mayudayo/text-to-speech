import { GoogleGenAI, Modality } from "@google/genai";

const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

export const generateAudioFromText = async (text: string, voice: string = 'Kore'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: TTS_MODEL,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voice,
          },
        },
      },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  const part = parts?.find(p => 'inlineData' in p);
  if (part && 'inlineData' in part && part.inlineData?.data) {
    return part.inlineData.data;
  }

  const textResponse = response.text?.trim();
  if (textResponse) {
    throw new Error(`APIは音声の代わりにテキスト応答を返しました: "${textResponse}"`);
  }
  throw new Error('API応答に音声データが見つかりませんでした。');
};
