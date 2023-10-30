import { elevenlabs } from "@/features/elevenlabs/elevenlabs";
import { speecht5 } from "@/features/speecht5/speecht5";
import { TalkStyle } from "@/features/messages/messages";

export async function synthesizeVoice(
  message: string,
  style: TalkStyle,
) {
  const ttsBackend = localStorage.getItem('chatvrm_tts_backend') ?? 'none';

  if (ttsBackend === 'elevenlabs') {
    const voiceId = atob(localStorage.getItem('chatvrm_elevenlabs_voiceid') ?? btoa('21m00Tcm4TlvDq8ikWAM'));
    const voice = await elevenlabs(message, voiceId, style);
    return { audio: voice.audio };
  }
  
  if (ttsBackend === 'speecht5') {
    const speakerEmbeddingUrl = localStorage.getItem('chatvrm_speecht5_speaker_embedding_url') ?? '/cmu_us_slt_arctic-wav-arctic_a0001.bin';

    const voice = await speecht5(message, speakerEmbeddingUrl, style);
    return { audio: voice.audio };
  }

  // ttsBackend === 'none'
  return { audio: null };
}
