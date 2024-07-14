import { Queue } from 'typescript-collections';
import { Message, Role, Screenplay, Talk, textsToScreenplay } from "./messages";
import { Viewer } from "@/features/vrmViewer/viewer";
import { Alert } from "@/features/alert/alert";

import { getEchoChatResponseStream } from './echoChat';
import { getOpenAiChatResponseStream } from './openAiChat';
import { getLlamaCppChatResponseStream, getLlavaCppChatResponse } from './llamaCppChat';
import { getWindowAiChatResponseStream } from './windowAiChat';
import { getOllamaChatResponseStream, getOllamaVisionChatResponse } from './ollamaChat';
import { getKoboldAiChatResponseStream } from './koboldAiChat';

import { piper } from "@/features/piper/piper";
import { elevenlabs } from "@/features/elevenlabs/elevenlabs";
import { coqui } from "@/features/coqui/coqui";
import { speecht5 } from "@/features/speecht5/speecht5";
import { openaiTTS } from "@/features/openaiTTS/openaiTTS";
import { localXTTSTTS} from "@/features/localXTTS/localXTTS";

import { AmicaLife } from '@/features/amicaLife/amicaLife';

import { config } from "@/utils/config";
import { cleanTalk } from "@/utils/cleanTalk";
import { processResponse } from "@/utils/processResponse";
import { wait } from "@/utils/wait";
import { isCharacterIdle, characterIdleTime } from "@/utils/isIdle";


type Speak = {
  audioBuffer: ArrayBuffer|null;
  screenplay: Screenplay;
  streamIdx: number;
}

type TTSJob = {
  screenplay: Screenplay;
  streamIdx: number;
}

export class Chat {
  public initialized: boolean;

  public viewer?: Viewer;
  public alert?: Alert;

  public setChatLog?: (messageLog: Message[]) => void;
  public setUserMessage?: (message: string) => void;
  public setAssistantMessage?: (message: string) => void;
  public setShownMessage?: (role: Role) => void;
  public setChatProcessing?: (processing: boolean) => void;


  // the message from the user that is currently being processed
  // it can be reset
  public stream: ReadableStream<Uint8Array>|null;
  public streams: ReadableStream<Uint8Array>[];
  public reader: ReadableStreamDefaultReader<Uint8Array>|null;
  public readers: ReadableStreamDefaultReader<Uint8Array>[];

  private amicaLife: AmicaLife;

  // process these immediately as they come in and add to audioToPlay
  public ttsJobs: Queue<TTSJob>;

  // this should be read as soon as they exist
  // and then deleted from the queue
  public speakJobs: Queue<Speak>;

  private currentAssistantMessage: string;
  private currentUserMessage: string;

  private lastAwake: number;

  private messageList: Message[];

  public currentStreamIdx: number;

  constructor() {
    this.initialized = false;

    this.stream = null;
    this.reader = null;
    this.streams = [];
    this.readers = [];

    this.amicaLife = new AmicaLife(this);
    this.ttsJobs = new Queue<TTSJob>();
    this.speakJobs = new Queue<Speak>();

    this.currentAssistantMessage = "";
    this.currentUserMessage = "";

    this.messageList = [];
    this.currentStreamIdx = 0;

    this.lastAwake = 0;
  }

  public initialize(
    viewer: Viewer,
    alert: Alert,
    setChatLog: (messageLog: Message[]) => void,
    setUserMessage: (message: string) => void,
    setAssistantMessage: (message: string) => void,
    setShownMessage: (role: Role) => void,
    setChatProcessing: (processing: boolean) => void,
  ) {
    this.viewer = viewer;
    this.alert = alert;
    this.setChatLog = setChatLog;
    this.setUserMessage = setUserMessage;
    this.setAssistantMessage = setAssistantMessage;
    this.setShownMessage = setShownMessage;
    this.setChatProcessing = setChatProcessing;

    // these will run forever
    this.processTtsJobs();
    this.processSpeakJobs();

    this.amicaLife.startIdleLoop();
    this.updateAwake();
    this.initialized = true;
  }

  public setMessageList(messages: Message[]) {
    this.messageList = messages;
    this.currentAssistantMessage = '';
    this.currentUserMessage = '';
    this.setChatLog!(this.messageList!);
    this.setAssistantMessage!(this.currentAssistantMessage);
    this.setUserMessage!(this.currentAssistantMessage);
    this.currentStreamIdx++;
  }

  // Get conversation list between user and assistant
  public getConvo(): Message[] {
    return this.messageList;
  }

  // function to import idle text prompt from user 
  public loadIdleTextPrompt(prompts: string []) {
      this.amicaLife.loadIdleTextPrompt(prompts);
  }

  // start/stop amica life depends on enable/disable button
  public startAmicaLife(flag: boolean) {
    flag === true ? this.amicaLife.startIdleLoop() : this.amicaLife.stopIdleLoop();
  }

  // function to pause/resume the loop when setting page is open/close
  public pauseAmicaLife(flag: boolean) {
    if (config("amica_life_enabled") === "true") {
      this.amicaLife.checkSettingOff(!flag);
    }
  }

  // function handle when amica got poked in amica life event
  
  // public handlePoked() {
  //   if (!this.isAwake() && config("amica_life_enabled") === "true") {
  //     console.log("Handling idle event:", "I just poked you!");
  //     this.receiveMessageFromUser("I just poked you!",true);
  //   }
  // }

  public idleTime(): number {
    return characterIdleTime(this.lastAwake);
  }

  public isAwake() {
    return !isCharacterIdle(this.lastAwake);
  }

  public updateAwake() {
    this.lastAwake = (new Date()).getTime();
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
      await wait(50);
    }
  }

  public async processSpeakJobs() {
    while (true) {
      do {
        const speak = this.speakJobs.dequeue();
        if (! speak) {
          break;
        }
        if (speak.streamIdx !== this.currentStreamIdx) {
          console.log('skipping speak for streamIdx');
          continue;
        }
        console.debug('processing speak');

        if((window as any).chatvrm_latency_tracker) {
          if((window as any).chatvrm_latency_tracker.active) {
            const ms = +(new Date)-(window as any).chatvrm_latency_tracker.start;
            console.log('performance_latency', ms);
            (window as any).chatvrm_latency_tracker.active = false;
          };
        }

        this.bubbleMessage("assistant",speak.screenplay.talk.message);

        if (speak.audioBuffer) {
          await this.viewer!.model?.speak(speak.audioBuffer, speak.screenplay);
          this.isAwake() ? this.updateAwake() : null;
        }
      } while (this.speakJobs.size() > 0);
      config("amica_life_enabled") === "true" ? !this.isAwake() && this.amicaLife.startIdleLoop() : null;
      await wait(50);
    }
  }

  public bubbleMessage(role: Role, text: string) {
    if (role === 'user') {
      // add space if there is already a partial message
      if (this.currentUserMessage !== '') {
        this.currentUserMessage += ' ';
      }
      this.currentUserMessage += text;
      this.setUserMessage!(this.currentUserMessage);
      this.setAssistantMessage!("");

      if (this.currentAssistantMessage !== '') {
        this.messageList!.push({
          role: "assistant",
          content: this.currentAssistantMessage,
        });

        this.currentAssistantMessage = '';
      }

      this.setChatLog!([
        ...this.messageList!,
        { role: "user", content: this.currentUserMessage },
      ]);
    }

    if (role === 'assistant') {
      if (this.currentAssistantMessage != '' && !this.isAwake() && config("amica_life_enabled") === 'true') {
        this.messageList!.push({
          role: "assistant",
          content: this.currentAssistantMessage,
        });

        this.currentAssistantMessage = text;
        this.setAssistantMessage!(this.currentAssistantMessage);
      } else {
        this.currentAssistantMessage += text;
        this.setUserMessage!("");
        this.setAssistantMessage!(this.currentAssistantMessage);
      }

      if (this.currentUserMessage !== '') {
        this.messageList!.push({
          role: "user",
          content: this.currentUserMessage,
        });

        this.currentUserMessage = '';
      }

      this.setChatLog!([
        ...this.messageList!,
        { role: "assistant", content: this.currentAssistantMessage },
      ]);
    }

    this.setShownMessage!(role);
    console.debug('bubbler', this.messageList)
  }

  public async interrupt() {
    this.currentStreamIdx++;
    try {
      if (this.reader) {
        console.debug('cancelling')
        if (! this.reader?.closed) {
          await this.reader?.cancel();
        }
        // this.reader = null;
        // this.stream = null;
        console.debug('finished cancelling')
      }
    } catch(e: any) {
      console.error(e.toString());
    }

    // TODO if llm type is llama.cpp, we can send /stop message here
    this.ttsJobs.clear();
    this.speakJobs.clear();
    // TODO stop viewer from speaking
  }

  // this happens either from text or from voice / whisper completion
  public async receiveMessageFromUser(message: string, amicaLife: boolean) {
    if (message === null || message === "") {
      return;
    }
    if (config("wake_word_enabled") === 'true') {
      this.updateAwake();
    }

    console.time('performance_interrupting');
    console.debug('interrupting...');
    await this.interrupt(); 
    console.timeEnd('performance_interrupting');
    await wait(0);
    console.debug('wait complete');

    if (!amicaLife || config("amica_life_enabled") === 'false') {
      console.log('receiveMessageFromUser', message);
      
      if (!/\[.*?\]/.test(message)) {
        message = `[neutral] ${message}`;

      
      if (message.toLowerCase().includes('news')) {
        console.log("Added news event to amica life");
        this.amicaLife.mainEvents.enqueue({events: "News"});
      }
        
      await this.amicaLife.pause();
      this.amicaLife.isSleep = false;
      this.amicaLife.triggerMessage = true;
      this.updateAwake();
      this.bubbleMessage("user",message);
    } 

    // make new stream
    const messages: Message[] = [
      { role: "system", content: config("system_prompt") },
      ...this.messageList!,
      { role: "user", content: amicaLife ? message : this.currentUserMessage},
    ];
    // console.debug('messages', messages);

    await this.makeAndHandleStream(messages);
  }


  public async makeAndHandleStream(messages: Message[]) {
    try {
      this.streams.push(await this.getChatResponseStream(messages));
    } catch(e: any) {
      const errMsg = e.toString();
      console.error(errMsg);
      this.alert?.error("Failed to get chat response", errMsg);
      return errMsg;
    }

    if (this.streams[this.streams.length-1] == null) {
      const errMsg = "Error: Null stream encountered.";
      console.error(errMsg);
      this.alert?.error("Null stream encountered", errMsg);
      return errMsg;
    }

    return await this.handleChatResponseStream();
  }

  public async handleChatResponseStream() {
    if (this.streams.length === 0) {
      console.log('no stream!');
      return;
    }

    this.currentStreamIdx++;
    const streamIdx = this.currentStreamIdx;
    this.setChatProcessing!(true);

    console.time('chat stream processing');
    let reader = this.streams[this.streams.length - 1].getReader();
    this.readers.push(reader);
    let sentences = new Array<string>();

    let aiTextLog = "";
    let tag = "";
    let rolePlay = "";
    let receivedMessage = "";

    let firstTokenEncountered = false;
    let firstSentenceEncountered = false;
    console.time('performance_time_to_first_token');
    console.time('performance_time_to_first_sentence');

    try {
      while (true) {
        if (this.currentStreamIdx !== streamIdx) {
          console.log('wrong stream idx');
          break;
        }
        const { done, value } = await reader.read();
        if (! firstTokenEncountered) {
          console.timeEnd('performance_time_to_first_token');
          firstTokenEncountered = true;
        }
        if (done) break;

        receivedMessage += value;
        receivedMessage = receivedMessage.trimStart();

        const proc = processResponse({
          sentences,
          aiTextLog,
          receivedMessage,
          tag,
          rolePlay,
          callback: (aiTalks: Screenplay[]): boolean => {
            // Generate & play audio for each sentence, display responses
            console.debug('enqueue tts', aiTalks);
            console.debug('streamIdx', streamIdx, 'currentStreamIdx', this.currentStreamIdx)
            if (streamIdx !== this.currentStreamIdx) {
              console.log('wrong stream idx');
              return true; // should break
            }
            this.ttsJobs.enqueue({
              screenplay: aiTalks[0],
              streamIdx: streamIdx,
            });

            if (! firstSentenceEncountered) {
              console.timeEnd('performance_time_to_first_sentence');
              firstSentenceEncountered = true;
            }

            return false; // normal processing
          }
        });

        sentences = proc.sentences;
        aiTextLog = proc.aiTextLog;
        receivedMessage = proc.receivedMessage;
        tag = proc.tag;
        rolePlay = proc.rolePlay;
        if (proc.shouldBreak) {
          break;
        }
        
      }
    } catch (e: any) {
      const errMsg = e.toString();
      this.bubbleMessage!('assistant', errMsg);
      console.error(errMsg);
    } finally {
      if (! reader.closed) {
        reader.releaseLock();
      }
      console.timeEnd('chat stream processing');
      if (streamIdx === this.currentStreamIdx) {
        this.setChatProcessing!(false);
      }
    }

    return aiTextLog;
  }

  async fetchAudio(talk: Talk): Promise<ArrayBuffer|null> {
    // TODO we should remove non-speakable characters
    // since this depends on the tts backend, we should do it
    // in their respective functions
    // this is just a simple solution for now
    talk = cleanTalk(talk);
    if (talk.message.trim() === '' || config("tts_muted") === 'true') {
      return null;
    }

    try {
      switch (config("tts_backend")) {
        case 'none': {
          return null;
        }
        case 'elevenlabs': {
          const voiceId = config("elevenlabs_voiceid");
          const voice = await elevenlabs(talk.message, voiceId, talk.style);
          return voice.audio;
        }
        case 'speecht5': {
          const speakerEmbeddingUrl = config('speecht5_speaker_embedding_url');
          const voice = await speecht5(talk.message, speakerEmbeddingUrl);
          return voice.audio;
        }
        case 'coqui': {
          const voiceId = config('coqui_voice_id');
          const voice = await coqui(talk.message, voiceId, talk.style);
          return voice.audio;
        }
        case 'openai_tts': {
          const voice = await openaiTTS(talk.message);
          return voice.audio;
        }
        case 'localXTTS': {
          const voice = await localXTTSTTS(talk.message);
        }
        case 'piper': {
          const voice = await piper(talk.message);
          return voice.audio;
        }
      }
    } catch (e: any) {
      console.error(e.toString());
      this.alert?.error("Failed to get TTS response", e.toString());
    }

    return null;
  }

  public async getChatResponseStream(messages: Message[]) {
    console.debug('getChatResponseStream', messages);
    const chatbotBackend = config("chatbot_backend");

    switch (chatbotBackend) {
      case 'chatgpt':
        return getOpenAiChatResponseStream(messages);
      case 'llamacpp':
        return getLlamaCppChatResponseStream(messages);
      case 'windowai':
        return getWindowAiChatResponseStream(messages);
      case 'ollama':
        return getOllamaChatResponseStream(messages);
      case 'koboldai':
        return getKoboldAiChatResponseStream(messages);
    }

    return getEchoChatResponseStream(messages);
  }

  public async getVisionResponse(imageData: string) {
    try {
      const visionBackend = config("vision_backend");

      console.debug('vision_backend', visionBackend);

      const messages: Message[] = [
        { role: "system", content: config("vision_system_prompt") },
        ...this.messageList!,
        {
          role: 'user',
          content: "Describe the image as accurately as possible"
        },
      ];

      let res = '';
      if (visionBackend === 'vision_llamacpp') {
        res = await getLlavaCppChatResponse(messages, imageData);
      } else if (visionBackend === 'vision_ollama') {
        res = await getOllamaVisionChatResponse(messages, imageData);
      } else {
        console.warn('vision_backend not supported', visionBackend);
        return;
      }

      await this.makeAndHandleStream([
        { role: "system", content: config("system_prompt") },
        ...this.messageList!,
        {
          role: "user",
          content: `This is a picture I just took from my webcam (described between [[ and ]] ): [[${res}]] Please respond accordingly and as if it were just sent and as though you can see it.`,
        },
      ]);
    } catch (e: any) {
      console.error("getVisionResponse", e.toString());
      this.alert?.error("Failed to get vision response", e.toString());
    }
  }

}
