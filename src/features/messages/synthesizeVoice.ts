import { elevenlabs } from "@/features/elevenlabs/elevenlabs";
import { TalkStyle } from "@/features/messages/messages";

export async function synthesizeVoice(
  message: string,
  style: TalkStyle,
) {
  const voice_id = 'GTYtUrlPOOn3WGf39gSO';
  const voice = await elevenlabs(message, voice_id, style);
  console.log('synthesizeVoice', voice)
  return { audio: voice.audio };
}
