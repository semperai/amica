const defaults = {
  autosend_from_mic: 'true',
  debug_gfx: 'false',
  language: 'en',
  show_introduction: 'true',
  show_add_to_homescreen: 'true',
  bg_color: process.env.NEXT_PUBLIC_BG_COLOR ?? '',
  bg_url: process.env.NEXT_PUBLIC_BG_URL ?? '/bg/bg-landscape1.jpg',
  vrm_url: process.env.NEXT_PUBLIC_VRM_URL ?? '/vrm/AvatarSample_A.vrm',
  youtube_videoid: '',
  animation_url: process.env.NEXT_PUBLIC_ANIMATION_URL ?? '/animations/idle_loop.vrma',
  voice_url: process.env.NEXT_PUBLIC_VOICE_URL ?? '',
  chatbot_backend: process.env.NEXT_PUBLIC_CHATBOT_BACKEND ?? 'echo',
  openai_apikey: process.env.NEXT_PUBLIC_OPENAI_APIKEY ?? '',
  openai_url: process.env.NEXT_PUBLIC_OPENAI_URL ?? 'https://api.openai.com',
  openai_model: process.env.NEXT_PUBLIC_OPENAI_MODEL ?? 'gpt-3.5-turbo',
  llamacpp_url: process.env.NEXT_PUBLIC_LLAMACPP_URL ?? 'http://127.0.0.1:8080',
  ollama_url: process.env.NEXT_PUBLIC_OLLAMA_URL ?? 'http://localhost:11434',
  ollama_model: process.env.NEXT_PUBLIC_OLLAMA_MODEL ?? 'llama2',
  koboldai_url: process.env.NEXT_PUBLIC_KOBOLDAI_URL ?? 'http://localhost:5001',
  koboldai_use_extra: process.env.NEXT_PUBLIC_KOBOLDAI_USE_EXTRA ?? 'false',
  tts_muted: 'false',
  tts_backend: process.env.NEXT_PUBLIC_TTS_BACKEND ?? 'none',
  stt_backend: process.env.NEXT_PUBLIC_STT_BACKEND ?? 'whisper_browser',
  vision_backend: process.env.NEXT_PUBLIC_VISION_BACKEND ?? 'none',
  vision_system_prompt: process.env.NEXT_PUBLIC_VISION_SYSTEM_PROMPT ?? `You are a friendly human named Amica. Describe the image in detail. Let's start the conversation.`,
  vision_llamacpp_url: process.env.NEXT_PUBLIC_VISION_LLAMACPP_URL ?? 'http://127.0.0.1:8081',
  vision_ollama_url: process.env.NEXT_PUBLIC_VISION_OLLAMA_URL ?? 'http://localhost:11434',
  vision_ollama_model: process.env.NEXT_PUBLIC_VISION_OLLAMA_MODEL ?? 'llava',
  whispercpp_url: process.env.NEXT_PUBLIC_WHISPERCPP_URL ?? 'http://localhost:8080',
  openai_whisper_apikey: process.env.NEXT_PUBLIC_OPENAI_WHISPER_APIKEY ?? '',
  openai_whisper_url: process.env.NEXT_PUBLIC_OPENAI_WHISPER_URL ?? 'https://api.openai.com',
  openai_whisper_model: process.env.NEXT_PUBLIC_OPENAI_WHISPER_MODEL ?? 'whisper-1',
  openai_tts_apikey: process.env.NEXT_PUBLIC_OPENAI_TTS_APIKEY ?? '',
  openai_tts_url: process.env.NEXT_PUBLIC_OPENAI_TTS_URL ?? 'https://api.openai.com',
  openai_tts_model: process.env.NEXT_PUBLIC_OPENAI_TTS_MODEL ?? 'tts-1',
  openai_tts_voice: process.env.NEXT_PUBLIC_OPENAI_TTS_VOICE ?? 'nova',
  elevenlabs_apikey: process.env.NEXT_PUBLIC_ELEVENLABS_APIKEY ??'',
  elevenlabs_voiceid: process.env.NEXT_PUBLIC_ELEVENLABS_VOICEID ?? '21m00Tcm4TlvDq8ikWAM',
  elevenlabs_model: process.env.NEXT_PUBLIC_ELEVENLABS_MODEL ?? 'eleven_monolingual_v1',
  speecht5_speaker_embedding_url: process.env.NEXT_PUBLIC_SPEECHT5_SPEAKER_EMBEDDING_URL ?? '/speecht5_speaker_embeddings/cmu_us_slt_arctic-wav-arctic_a0001.bin',
  coqui_apikey: process.env.NEXT_PUBLIC_COQUI_APIKEY ?? "",
  coqui_voice_id: process.env.NEXT_PUBLIC_COQUI_VOICEID ?? "71c6c3eb-98ca-4a05-8d6b-f8c2b5f9f3a3",
  name: process.env.NEXT_PUBLIC_NAME ?? 'Amica',
  system_prompt: process.env.NEXT_PUBLIC_SYSTEM_PROMPT ?? `You will behave as a friendly human named Amica and engage in conversation with the user. There are five types of emotions: 'neutral' which indicates normality, 'happy' which indicates joy, 'angry' which indicates anger, 'sad' which indicates sadness, and 'relaxed' which indicates calmness.
The format of each message is as follows:
[neutral|happy|angry|sad|relaxed] {message}

Here are some examples:
[neutral] Hello. [happy] How are you doing?
[happy] Isn't this outfit cute?
[happy] Lately, I'm obsessed with clothes from this shop!
[sad] Sorry, I forgot.
[sad] Is there anything interesting lately?
[angry] What? Don't keep it a secret, that's not fair!
[neutral] What are your plans for summer vacation? [happy] Should we go to the beach?

Please respond with only one appropriate message. Please do not use overly polite language. Please be open about yourself. Let's start the conversation.`,
};

function prefixed(key: string) {
  return `chatvrm_${key}`;
}

export function config(key: string): string {
  if (localStorage.hasOwnProperty(prefixed(key))) {
    return (<any>localStorage).getItem(prefixed(key));
  }

  if (defaults.hasOwnProperty(key)) {
    return (<any>defaults)[key];
  }

  throw new Error(`config key not found: ${key}`);
}

export function updateConfig(key: string, value: string) {
  if (defaults.hasOwnProperty(key)) {
    localStorage.setItem(prefixed(key), value);
    return;
  }

  throw new Error(`config key not found: ${key}`);
}

export function defaultConfig(key: string): string {
  if (defaults.hasOwnProperty(key)) {
    return (<any>defaults)[key];
  }

  throw new Error(`config key not found: ${key}`);
}

export function resetConfig() {
  Object.entries(defaults).forEach(([key, value]) => {
    updateConfig(key, value);
  });
}
