import { config } from '@/utils/config';

export async function openaiWhisper(
  file: File,
  prompt?: string,
) {
  const apiKey = config("openai_whisper_apikey");
  if (!apiKey) {
    throw new Error("Invalid API Key");
  }

  // Request body
  const formData = new FormData();
  formData.append('file', file);
  formData.append('model', config('openai_whisper_model'));
  formData.append('language', 'en');
  if (prompt) {
    formData.append('prompt', prompt);
  }

  console.log(formData);

  try {
    const res = await fetch(`https://api.openai.com/v1/audio/transcriptions`, {
      method: "POST",
      body: formData,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });
    if (! res.ok) {
      throw new Error("OpenAI Whisper API Error");
    }
    const data = await res.json();
    console.log('whisper api', data);

    return { text: data.text };
  } catch (e) {
    console.error('ERROR', e);
    throw new Error("OpenAI Whisper API Error");
  }
}