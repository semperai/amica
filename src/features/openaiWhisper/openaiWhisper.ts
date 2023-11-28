import { config } from '@/utils/config';

export async function openaiWhisper(
  file: File,
  prompt?: string,
) {
  const apiKey = config("openai_whisper_apikey");
  if (!apiKey) {
    throw new Error("Invalid OpenAI Whisper API Key");
  }

  // Request body
  const formData = new FormData();
  formData.append('file', file);
  formData.append('model', config('openai_whisper_model'));
  formData.append('language', 'en');
  if (prompt) {
    formData.append('prompt', prompt);
  }

  console.debug('whisper-openai req', formData);

  const res = await fetch(`${config("openai_whisper_url")}/v1/audio/transcriptions`, {
    method: "POST",
    body: formData,
    headers: {
      "Authorization": `Bearer ${apiKey}`,
    },
  });
  if (! res.ok) {
    throw new Error(`OpenAI Whisper API Error (${res.status})`);
  }
  const data = await res.json();
  console.debug('whisper-openai res', data);

  return { text: data.text.trim() };
}
