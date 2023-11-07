export function cleanTranscript(transcript: string) {
  console.log('transcript', transcript);
  let text = transcript.trim();
  text = text.replaceAll(/\[.+\]|{.+}|\(.+\)/gm, '');
  return text.trim();
}
