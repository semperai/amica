import { elevenlabs } from "@/features/elevenlabs/elevenlabs";
import { speecht5 } from "@/features/speecht5/speecht5";
import { TalkStyle } from "@/features/messages/messages";
import { config } from "@/utils/config";

export async function synthesizeVoice(
  message: string,
  style: TalkStyle,
) {
  const ttsBackend = config("tts_backend");

  if (ttsBackend === 'elevenlabs') {
    const voiceId = config("elevenlabs_voiceid");
    const voice = await elevenlabs(message, voiceId, style);
    return { audio: voice.audio };
  }
  
  if (ttsBackend === 'speecht5') {
    const speakerEmbeddingUrl = config('speecht5_speaker_embedding_url');
    const voice = await speecht5(message, speakerEmbeddingUrl, style);
    return { audio: voice.audio };
  }

  // ttsBackend === 'none'
  return { audio: null };
}
