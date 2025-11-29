import { config } from '@/utils/config';

type ApiType = 'standard' | 'fastapi';

const apiConfigs: Record<ApiType, {
  ttsEndpoint: (url: string) => string;
  ttsBody: (message: string, voice: string) => Record<string, unknown>;
  voicesEndpoint: (url: string) => string;
  voicesAccept: string;
  parseVoiceList: (data: any) => { voices: string[] };
}> = {
  standard: {
    ttsEndpoint: (url) => `${url}/tts`,
    ttsBody: (message, voice) => ({ text: message, voice }),
    voicesEndpoint: (url) => `${url}/voices`,
    voicesAccept: "application/text",
    parseVoiceList: (data) => data,
  },
  fastapi: {
    ttsEndpoint: (url) => `${url}/v1/audio/speech`,
    ttsBody: (message, voice) => ({
      input: message,
      voice,
      model: "kokoro",
      response_format: "wav",
    }),
    voicesEndpoint: (url) => `${url}/v1/audio/voices`,
    voicesAccept: "application/json",
    parseVoiceList: (data) => {
      if (data?.data && Array.isArray(data.data)) {
        return { voices: data.data.map((voice: any) => voice.id) };
      }
      return data;
    },
  },
};

async function fetchAudio(message: string): Promise<ArrayBuffer> {
  const apiType = config("kokoro_api_type") as ApiType;
  const apiConfig = apiConfigs[apiType];
  const url = config("kokoro_url");
  const voice = config("kokoro_voice");

  const res = await fetch(apiConfig.ttsEndpoint(url), {
    method: "POST",
    body: JSON.stringify(apiConfig.ttsBody(message, voice)),
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    console.error(res);
    throw new Error("Kokoro TTS API Error");
  }

  return (await res.arrayBuffer()) as any;
}

async function fetchVoiceList(): Promise<{ voices: string[] }> {
  const apiType = config("kokoro_api_type") as ApiType;
  const apiConfig = apiConfigs[apiType];
  const url = config("kokoro_url");

  const response = await fetch(apiConfig.voicesEndpoint(url), {
    method: 'GET',
    headers: { 'Accept': apiConfig.voicesAccept },
  });

  const data = await response.json();
  return apiConfig.parseVoiceList(data);
}

export async function kokoro(message: string) {
  try {
    const audio = await fetchAudio(message);
    return { audio };
  } catch (e) {
    console.error('ERROR', e);
    throw new Error("Kokoro TTS API Error");
  }
}

export async function kokoroVoiceList() {
  try {
    return await fetchVoiceList();
  } catch (error) {
    console.error('Error fetching kokoro voice:', error);
    throw error;
  }
}
