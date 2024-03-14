export function cleanTranscript(transcript: string) {
  console.log('transcript', transcript);
  let text = transcript.trim();
  text = text.replaceAll(/\[.+\]|{.+}|\(.+\)/gm, '');
  return text.trim();
}

export function cleanFromWakeWord(text: string, wakeWord: string) {
  if (!text.toLowerCase().startsWith(wakeWord.toLowerCase())) {
    return text;
  }

  const wakeWordLength = wakeWord.split(" ").length;

  return text.split(" ").slice(wakeWordLength).join(" ");
}

export function cleanFromPunctuation(text: string) {
  return text.toLowerCase().replace(/[^\w\s\']|_/g, "").replace(/\s+/g, " ");
}