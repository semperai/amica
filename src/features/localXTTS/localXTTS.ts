import { config } from '@/utils/config';

export async function localXTTSTTS(message: string) {
  const baseUrl = config("localXTTS_url")
    .replace(/\/+$/, '')
    .replace('/api/tts-generate', '');

  // Log the config values for debugging
  console.log('[AllTalk] Config values:', {
    url: config("localXTTS_url"),
    version: config("alltalk_version"),
    voice: config("alltalk_voice"),
    rvcVoice: config("alltalk_rvc_voice"),
    rvcPitch: config("alltalk_rvc_pitch"),
    language: config("alltalk_language")
  });

  const formData = new URLSearchParams({
    text_input: message,
    text_filtering: 'standard',
    character_voice_gen: config("alltalk_voice") || 'female_01.wav',
    narrator_enabled: 'false',
    narrator_voice_gen: config("alltalk_voice") || 'female_01.wav',
    text_not_inside: 'character',
    language: config("alltalk_language") || 'en',
    output_file_name: 'amica_output',
    output_file_timestamp: 'true',
    autoplay: 'false',
    autoplay_volume: '0.8',
  });

  // Add RVC parameters only for V2
  if (config("alltalk_version") === "v2") {
    const rvcVoice = config("alltalk_rvc_voice");
    if (rvcVoice && rvcVoice !== 'Disabled') {
      formData.append('rvccharacter_voice_gen', rvcVoice);
      formData.append('rvccharacter_pitch', config("alltalk_rvc_pitch") || '0');
    }
  }

  try {
    console.log('[AllTalk] Processing text:', message);
    console.log('[AllTalk] Form data:', Object.fromEntries(formData));
    
    const res = await fetch(`${baseUrl}/api/tts-generate`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      console.error('[AllTalk] Initial request failed:', res.status, res.statusText);
      throw new Error("AllTalk TTS API Error");
    }

    const data = await res.json();
    console.log('[AllTalk] TTS Response:', data);
    
    // Handle V1/V2 URL differences
    const audioUrl = config("alltalk_version") === "v1" 
      ? data.output_file_url  // V1 returns full URL
      : `${baseUrl}${data.output_file_url}`; // V2 returns relative path

    console.log('[AllTalk] Generated audio URL:', audioUrl);

    // Fetch the actual audio data
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error("Failed to fetch audio data");
    }

    const audioData = await audioResponse.arrayBuffer();
    console.log('[AllTalk] Received audio data size:', audioData.byteLength);

    return { audio: audioData };
  } catch (e) {
    console.error('[AllTalk] Error:', e);
    throw new Error(`AllTalk TTS Error: ${(e as Error).message}`);
  }
}
