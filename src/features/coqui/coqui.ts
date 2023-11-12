import { TalkStyle } from "@/features/chat/messages";
import { config } from '@/utils/config';

export async function coqui(
  message: string,
  voiceId: string,
  style: TalkStyle
) {
  const apiKey = config('coqui_apikey');
  if (!apiKey) {
    throw new Error("Coqui API Key not set");
  }

  let emotion = 'Neutral';
  if (style === 'talk')      emotion = 'Neutral';
  if (style === 'happy')     emotion = 'Happy';
  if (style === 'sad')       emotion = 'Sad';
  if (style === 'angry')     emotion = 'Anger';
  if (style === 'surprised') emotion = 'Surprise';
  // if (style === 'fear')   emotion = ''; // NOT SUPPORTED

  const res = await fetch(`https://app.coqui.ai/api/v2/samples`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      voice_id: voiceId,
      text: message,
      emotion,
      language: 'en',
    }),
  });
  if (! res.ok) {
    throw new Error(`Coqui API Error (${res.status})`);
  }

  const data = await res.json();
  console.debug('coqui data', JSON.stringify(data));

  const res2 = await fetch(data.audio_url);
  const data2 = await res2.arrayBuffer();

  return { audio: data2 };
}