import { TalkStyle } from "@/features/messages/messages";

export async function elevenlabs(
  message: string,
  voice_id: string,
  style: TalkStyle,
) {
  const apiKey = atob(localStorage.getItem("chatvrm_elevenlabs_apikey") ?? "");
  if (! apiKey) {
    throw new Error("Invalid EleveLabs API Key");
  }

  // Request body
  const body = {
    text: message,
    model_id: "eleven_monolingual_v1",
    voice_settings: {
      stability: 0,
      similarity_boost: 0,
      style: 0,
      use_speaker_boost: true
    }
  };

  try {
    const elevenlabsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}?optimize_streaming_latency=0&output_format=mp3_44100_128`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
        "xi-api-key": apiKey,
      },
    });
    if (! elevenlabsRes.ok) {
      throw new Error("ElevenLabs API Error");
    }
    const data = (await elevenlabsRes.arrayBuffer()) as any;

    return { audio: data };
  } catch (e) {
    console.error('ERROR', e);
    throw new Error("ElevenLabs API Error");
  }
}
