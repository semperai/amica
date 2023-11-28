import { config } from '@/utils/config';

export async function whispercpp(
  file: File,
  prompt?: string,
) {
  // Request body
  const formData = new FormData();
  formData.append('file', file);
  if (prompt) {
    formData.append('prompt', prompt);
  }

  console.debug('whispercpp req', formData);

  const res = await fetch(`${config("whispercpp_url")}/inference`, {
    method: "POST",
    body: formData,
    headers: {
      'Accept': 'text/html',
    },
  });
  if (! res.ok) {
    throw new Error(`Whisper.cpp API Error (${res.status})`);
  }
  const data = await res.json();
  console.debug('whispercpp res', data);

  return { text: data.text.trim() };
}
