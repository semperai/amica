import { config } from '@/utils/config';

export async function kokoro(
  message: string,
) {
  try {
    const res = await fetch(`${config("kokoro_url")}/tts`, {
      method: "POST",
      body: JSON.stringify({
        text: message,
        voice: config("kokoro_voice"),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (! res.ok) {
      console.error(res);
      throw new Error("Kokoro TTS API Error");
    }
    const data = (await res.arrayBuffer()) as any;

    return { audio: data };
  } catch (e) {
    console.error('ERROR', e);
    throw new Error("Kokoro TTS API Error");
  }
}

export async function kokoroVoiceList(
) {
  try {
    const response = await fetch(`${config("kokoro_url")}/voices`, {
      method: 'GET',
      headers: {
        'Accept': "application/text",
      }
    })

    return response.json();

  } catch (error) {

    console.error('Error fetching kokoro voice:', error);
    throw error;
  }
}
