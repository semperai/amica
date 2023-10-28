import * as fs from 'fs';
import { TalkStyle } from "@/features/messages/messages";

export async function sileroTTS(
  message: string,
  voice_id: string,
  style: TalkStyle,
) {
  const sileroUrl = localStorage.getItem("chatvrm_silero_url") ?? "http://127.0.0.1:8001";
  const sileroSessionPath = localStorage.getItem("chatvrm_silero_sessionpath") ?? "/tmp";
  const sileroVoiceId = localStorage.getItem("chatvrm_silero_voiceid") ?? "en_42";

  const initBody = {
    path: sileroSessionPath,
  }
  const initRes = await fetch(`${sileroUrl}/tts/init_session`, {
    method: 'POST',
    body: JSON.stringify(initBody),
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
  });

  // check initRes status
  if (!initRes.ok) {
    console.error(await initRes.json());
    throw new Error('Silero init failed');
  }
  

  // Request body
  const body = {
    speaker: sileroVoiceId,
    text: message,
    session: 'silero',
  };

  const res = await fetch(`${sileroUrl}/tts/generate`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
  });
  if (!res.ok) {
    console.error(await res.json());
    throw new Error('Silero tts generate failed');
  }

  return { audio: null };
}
