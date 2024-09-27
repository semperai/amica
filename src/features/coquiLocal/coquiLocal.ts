import { config } from '@/utils/config';

export async function coquiLocal(
  message: string,
) {
    
  const voiceId = config("coquiLocal_voiceid");
  if (!voiceId) {
    throw new Error("Invalid CoquiLocal TTS Voice Id");
  }

  try {
    const res = await fetch(`${config("coquiLocal_url")}/api/tts`, {
      method: 'POST',
      headers: {
        'text': message,
        'speaker-id': config("coquiLocal_voiceid"),
      }
    });

    const data = await res.arrayBuffer()
    return { audio: data };

  } catch (error) {

    console.error('Error in coquiLocal:', error);
    throw error;
  }
}

export async function coquiLocalVoiceIdList(
) {
  try {
    const response = await fetch(`${config("coquiLocal_url")}/`, {
      method: 'GET',
      headers: {
        'Accept': "application/text",
      }
    })
    const html = await response.text();
    const selectedValues = html.match(/value="([^"]+)" SELECTED/g)?.map((match) => match.split('"')[1]) || [];

    return { list : selectedValues};

  } catch (error) {

    console.error('Error in coquiLocalVoiceIdList:', error);
    throw error;
  }
}