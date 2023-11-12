import { TalkStyle } from "@/features/chat/messages";
import { config } from '@/utils/config';

export async function elevenlabs(
  message: string,
  voiceId: string,
  style: TalkStyle,
) {
  const apiKey = config("elevenlabs_apikey");
  if (! apiKey) {
    throw new Error("Invalid ElevenLabs API Key");
  }

  // Request body
  const body = {
    text: message,
    model_id: config("elevenlabs_model"),
    voice_settings: {
      stability: 0,
      similarity_boost: 0,
      style: 0,
      use_speaker_boost: true
    }
  };

  const elevenlabsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=0&output_format=mp3_44100_128`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "Accept": "audio/mpeg",
      "xi-api-key": apiKey,
    },
  });
  if (! elevenlabsRes.ok) {
    throw new Error(`ElevenLabs API Error (${elevenlabsRes.status})`);
  }
  const data = (await elevenlabsRes.arrayBuffer()) as any;

  return { audio: data };
}
