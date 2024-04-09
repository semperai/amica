import { Queue } from 'typescript-collections';
import { wait } from "@/utils/wait";

import { Backend } from './backend';
import { Screenplay, Talk } from './messages';
import { cleanTalk } from '@/utils/cleanTalk';
import { BotProps } from './bot-options';
import { TTSPropsSchema } from './tts-options';
import type { TTSProps } from './tts-options';

type Speak = {
  audioBuffer: ArrayBuffer|null;
  screenplay: Screenplay;
  streamIdx: number;
}

type TTSJob = {
  screenplay: Screenplay;
  streamIdx: number;
}

export declare interface TTSBackend extends TTSProps {
  current?: TTSBackend;
}

export class TTSBackend extends Backend {
  public ttsJobs!: Queue<TTSJob>;

  initialize(args?: any) {
    this.ttsJobs = new Queue<TTSJob>();
    super.initialize(args);
  }

  removeNonSpeakableChars(talk: Talk) {
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

  public async processTtsJobs() {
    while (true) {
      do {
        const ttsJob = this.ttsJobs.dequeue();
        if (! ttsJob) {
          break;
        }

        console.debug('processing tts');
        if (ttsJob.streamIdx !== this.currentStreamIdx) {
          console.log('skipping tts for streamIdx');
          continue;
        }

        console.time('performance_tts');
        const audioBuffer = await this.fetchAudio(ttsJob.screenplay.talk);
        console.timeEnd('performance_tts');
        this.speakJobs.enqueue({
          audioBuffer,
          screenplay: ttsJob.screenplay,
          streamIdx: ttsJob.streamIdx,
        });
      } while (this.ttsJobs.size() > 0);
      await wait(100);
    }
  }

  async fetchAudio(talk: Talk): Promise<ArrayBuffer|null> {
    if (!this.current) return null;
    // TODO we should remove non-speakable characters
    // since this depends on the tts backend, we should do it
    // in their respective functions
    // this is just a simple solution for now
    talk = this.removeNonSpeakableChars(talk);
    if (talk.message.trim() === '' || this.muted) {
      return null;
    }
    try {
      const voice = await this.current.say(talk)
      return voice.audio;
    } catch (e: any) {
      this.emit('error', e, 'Failed to get TTS response')
    }

    return null;
  }

}

TTSBackend.defineProperties(TTSBackend, TTSPropsSchema)

Backend.register(TTSBackend)

