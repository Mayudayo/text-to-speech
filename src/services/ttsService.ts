const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export const generateAudioFromText = async (text: string, voice: string = 'Kore'): Promise<string> => {
  const apiKey = 'AIzaSyA0O1Pwtqctqt7XpnOuq6piUnZNF0TPnAg';

  console.log('Using API Key:', apiKey.substring(0, 10) + '...');

  if (!apiKey) {
    throw new Error('API_KEY is not configured');
  }

  const url = `${API_BASE}/${TTS_MODEL}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voice,
          },
        },
      },
    },
  };

  console.log('Request URL:', url);
  console.log('Request Body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();
  console.log('Response Status:', response.status);
  console.log('Response Data:', JSON.stringify(data, null, 2));

  if (!response.ok) {
    throw new Error(data.error?.message || `API Error: ${response.status}`);
  }

  const parts = data.candidates?.[0]?.content?.parts;
  const part = parts?.find((p: any) => 'inlineData' in p);

  if (part && 'inlineData' in part && part.inlineData?.data) {
    return part.inlineData.data;
  }

  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (textResponse) {
    throw new Error(`APIは音声の代わりにテキスト応答を返しました: "${textResponse}"`);
  }

  throw new Error('API応答に音声データが見つかりませんでした。');
};
