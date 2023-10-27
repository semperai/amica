import { elevenlabs } from "@/features/elevenlabs/elevenlabs";
import { TalkStyle } from "@/features/messages/messages";

export async function synthesizeVoice(
  message: string,
  style: TalkStyle,
) {
  const ttsBackend = localStorage.getItem('chatvrm_tts_backend') ?? 'none';

  if (ttsBackend === 'elevenlabs') {
    const voiceId = localStorage.getItem('chatvrm_elevenlabs_voiceid') ?? 'GTYtUrlPOOn3WGf39gSO';
    const voice = await elevenlabs(message, voiceId, style);
    return { audio: voice.audio };
  }

  // ttsBackend === 'none'
  return { audio: null };
}
