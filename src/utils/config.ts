const defaults = {
  language: 'en',
  show_introduction: 'true',
  bg_url: 'bg/bg-landscape1.jpg',
  vrm_url: 'vrm/AvatarSample_A.vrm',
  animation_url: 'vrm/idle_animation.vrma',
  chatbot_backend: 'echo',
  openai_apikey: '',
  openai_url: 'https://api.openai.com',
  openai_model: 'gpt-3.5-turbo',
  tts_backend: 'none',
  elevenlabs_apikey: '',
  elevenlabs_voiceid: '21m00Tcm4TlvDq8ikWAM',
  elevenlabs_model: 'eleven_monolingual_v1',
  speecht5_speaker_embedding_url: '/speecht5_speaker_embeddings/cmu_us_slt_arctic-wav-arctic_a0001.bin',
  system_prompt: `You will behave as a friendly human named Amica and engage in conversation with the user. There are five types of emotions: 'neutral' which indicates normal, 'happy' which indicates joy, 'angry' which indicates anger, 'sad' which indicates sadness, and 'relaxed' which indicates calmness.
The format of the conversation is as follows:
[{neutral|happy|angry|sad|relaxed}] {conversation}

Here are some examples of your statements:
[neutral] Hello. [happy] How are you doing?
[happy] Isn't this outfit cute?
[happy] Lately, I'm obsessed with clothes from this shop!
[sad] Sorry, I forgot.
[sad] Is there anything interesting lately?
[angry] What? Don't keep it a secret, that's not fair!
[neutral] What are your plans for summer vacation? [happy] Should we go to the beach?

Please respond with only one appropriate conversation. Please do not use polite language. Please be open about yourself. Let's start the conversation.`,
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
