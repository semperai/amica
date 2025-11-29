import { config } from '@/utils/config';

export type KokoroApiType = 'standard' | 'fastapi';

const apiConfigs: Record<KokoroApiType, {
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
    parseVoiceList: (data) => {
      if (data?.voices && Array.isArray(data.voices)) {
        return data;
      }
      if (Array.isArray(data)) {
        return { voices: data };
      }
      return { voices: [] };
    },
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
        const validVoices = data.data
          .filter((voice: any) => voice?.id && typeof voice.id === 'string')
          .map((voice: any) => voice.id);
        if (validVoices.length > 0) {
          return { voices: validVoices };
        }
      }
      if (data?.voices && Array.isArray(data.voices)) {
        const validVoices = data.voices.filter((voice: any) => typeof voice === 'string');
        if (validVoices.length > 0) {
          return { voices: validVoices };
        }
      }
      return { voices: [] };
    },
  },
};

async function fetchAudio(message: string): Promise<ArrayBuffer> {
  const rawType = config("kokoro_api_type");
  const apiType: KokoroApiType = rawType === "fastapi" ? "fastapi" : "standard";
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

  return await res.arrayBuffer();
}

async function fetchVoiceList(): Promise<{ voices: string[] }> {
  const rawType = config("kokoro_api_type");
  const apiType: KokoroApiType = rawType === "fastapi" ? "fastapi" : "standard";
  const apiConfig = apiConfigs[apiType];
  const url = config("kokoro_url");

  const response = await fetch(apiConfig.voicesEndpoint(url), {
    method: 'GET',
    headers: { 'Accept': apiConfig.voicesAccept },
  });

  if (!response.ok) {
    console.error(response);
    throw new Error("Kokoro TTS API Error");
  }

  const data = await response.json();
  return apiConfig.parseVoiceList(data);
}

export async function kokoro(message: string) {
  try {
    const audio = await fetchAudio(message);
    return { audio };
  } catch (e) {
    console.error('ERROR', e);
    throw new Error(`Kokoro TTS API Error: ${e instanceof Error ? e.message : String(e)}`);
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
