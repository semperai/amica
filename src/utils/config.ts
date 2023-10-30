const defaults = {
  language: 'en',
  show_introduction: 'true',
  bg_url: 'bg-landscape1.jpg',
  vrm_url: 'AvatarSample_A.vrm',
  chatbot_backend: 'echo',
  openai_apikey: '',
  openai_url: 'https://api.openai.com',
  openai_model: 'gpt-3.5-turbo',
  tts_backend: 'none',
  elevenlabs_apikey: '',
  elevenlabs_voiceid: '21m00Tcm4TlvDq8ikWAM',
  elevenlabs_model: 'eleven_monolingual_v1',
  speecht5_speaker_embedding_url: '/cmu_us_slt_arctic-wav-arctic_a0001.bin',
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
