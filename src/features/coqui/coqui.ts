import { config } from '@/utils/config';

export async function coqui(
  message: string,
  voiceId: string,
) {
  const apiKey = config('coqui_apikey');
  if (!apiKey) {
    throw new Error("Coqui API Key not set");
  }

  const res = await fetch(`https://app.coqui.ai/api/v2/samples/xtts/render/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      voice_id: voiceId,
      text: message,
      language: 'en',
    }),
  });
  if (! res.ok) {
    throw new Error(`Coqui API Error (${res.status})`);
  }

  const data = await res.json();
  console.debug('coqui data', data);

  const res2 = await fetch(data.audio_url);
  const data2 = await res2.arrayBuffer();

  return { audio: data2 };
}
