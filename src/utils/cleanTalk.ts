import { Talk } from '@/features/chat/messages';

export function cleanTalk(talk: Talk) {
  // remove emoticons
  talk.message = talk.message.replace(/[\u{1F600}-\u{1F64F}]/gu, '');

  // symbols & pictographs (1F300–1F5FF)
  talk.message = talk.message.replace(/[\u{1F300}-\u{1F5FF}]/gu, '');
  
  // transport & map symbols (1F680–1F6FF)
  talk.message = talk.message.replace(/[\u{1F680}-\u{1F6FF}]/gu, '');

  // flags (1F1E6–1F1FF)
  talk.message = talk.message.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '');

  // remove smiley faces
  talk.message = talk.message.replace(/ :\)/gu, ' ');
  talk.message = talk.message.replace(/ :D/gu, ' ');

  talk.message = talk.message.replace(/^:\)/gu, '');
  talk.message = talk.message.replace(/^:D/gu, '');

  // remove double spaces
  talk.message = talk.message.replace(/  /g, ' ');

  return talk;
}
