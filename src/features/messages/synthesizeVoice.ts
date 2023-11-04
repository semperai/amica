import { elevenlabs } from "@/features/elevenlabs/elevenlabs";
import { coqui } from "@/features/coqui/coqui";
import { speecht5 } from "@/features/speecht5/speecht5";
import { TalkStyle } from "@/features/messages/messages";
import { config } from "@/utils/config";

export async function synthesizeVoice(
  message: string,
  style: TalkStyle,
) {
  const ttsBackend = config("tts_backend");

  switch (ttsBackend) {
    case 'elevenlabs': {
      const voiceId = config("elevenlabs_voiceid");
      const voice = await elevenlabs(message, voiceId, style);
      return { audio: voice.audio };
    }
    case 'speecht5': {
      const speakerEmbeddingUrl = config('speecht5_speaker_embedding_url');
      const voice = await speecht5(message, speakerEmbeddingUrl, style);
      return { audio: voice.audio };
    }
    case 'coqui': {
      const speakerId = config('coqui_speaker_id');
      const voice = await coqui(message, speakerId);
      return { audio: voice.audio };
    }
  }

  // ttsBackend === 'none'
  return { audio: null };
}
