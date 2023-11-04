import { config } from '@/utils/config';

export async function coqui(
  message: string,
  speakerId: string,
) {
  try {
    const res = await fetch(`${config("coqui_url")}/api/tts?text=${
      encodeURIComponent(message)
    }&speaker_id=${speakerId}&style_wav=&language_id=`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "audio/wav",
      },
    });
    if (! res.ok) {
      throw new Error("Coqui API Error");
    }
    const data = (await res.arrayBuffer()) as any;

    return { audio: data };
  } catch (e) {
    console.error('ERROR', e);
    throw new Error("Coqui API Error");
  }
}
