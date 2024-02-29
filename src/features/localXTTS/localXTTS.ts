// Basic support for AllTalk XTTS (https://github.com/erew123/alltalk_tts)

import { config } from '@/utils/config';

export async function localXTTSTTS(message:string){ 
  const formData = new URLSearchParams({
    text_input: message,
    streaming: 'false',
    text_filtering: 'none',
    character_voice_gen: 'female_01.wav',
    narrator_enabled: 'false', 
    narrator_voice_gen: 'male_01.wav',
    text_not_inside: 'character',
    language: 'en',
    output_file_name: 'myoutputfile',
    output_file_timestamp: 'true',
    autoplay: 'true',
    autoplay_volume: '0.8',
  });

  try {
    const res = await fetch("http://127.0.0.1:7851/api/tts-generate", {
      method: "POST",
      body: formData,
      
    });
    if (!res.ok) {
      console.error(res);
      throw new Error("localXTTS TTS API Error");
    }
    const data = await res.json(); 

    return {
      debugmsg: console.log(data.output_file_url),
      audio: data.output_file_url, 
    };
  } catch (e) {
    console.error('ERROR', e);
    throw new Error("localXTTS TTS API Error");
  }
}
