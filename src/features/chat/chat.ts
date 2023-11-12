import { Queue } from 'typescript-collections';
import { Message, Role, Screenplay, Talk, textsToScreenplay } from "./messages";
import { Viewer } from "@/features/vrmViewer/viewer";

import { getEchoChatResponseStream } from './echoChat';
import { getOpenAiChatResponseStream } from './openAiChat';
import { getLlamaCppChatResponseStream } from './llamaCppChat';
import { getWindowAiChatResponseStream } from './windowAiChat';

import { elevenlabs } from "@/features/elevenlabs/elevenlabs";
import { coqui } from "@/features/coqui/coqui";
import { speecht5 } from "@/features/speecht5/speecht5";
import { openaiTTS } from "@/features/openaiTTS/openaiTTS";
import { config } from "@/utils/config";

import { wait } from "@/utils/wait";

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

  // process these immediately as they come in and add to audioToPlay
  public ttsJobs: Queue<TTSJob>;

  // this should be read as soon as they exist
  // and then deleted from the queue
  public speakJobs: Queue<Speak>;

  private currentAssistantMessage: string;
  private currentUserMessage: string;

  private messageList: Message[];

  private currentStreamIdx: number;

  constructor() {
    this.initialized = false;

    this.stream = null;
    this.reader = null;
    this.streams = [];
    this.readers = [];

    this.ttsJobs = new Queue<TTSJob>();
    this.speakJobs = new Queue<Speak>();

    this.currentAssistantMessage = "";
    this.currentUserMessage = "";

    this.messageList = [];
    this.currentStreamIdx = 0;
  }

  public initialize(
    viewer: Viewer,
    setChatLog: (messageLog: Message[]) => void,
    setUserMessage: (message: string) => void,
    setAssistantMessage: (message: string) => void,
    setShownMessage: (role: Role) => void,
    setChatProcessing: (processing: boolean) => void,
  ) {
    this.viewer = viewer;
    this.setChatLog = setChatLog;
    this.setUserMessage = setUserMessage;
    this.setAssistantMessage = setAssistantMessage;
    this.setShownMessage = setShownMessage;
    this.setChatProcessing = setChatProcessing;

    // these will run forever
    this.processTtsJobs();
    this.processSpeakJobs();

    this.initialized = true;
  }

  public setMessageList(messages: Message[]) {
    this.messageList = messages;
    this.setChatLog!(this.messageList!);
    this.currentAssistantMessage = '';
    this.currentUserMessage = '';
    this.currentStreamIdx++;
  }

  public async processTtsJobs() {
    while (true) {
      do {
        const ttsJob = this.ttsJobs.dequeue();
        if (! ttsJob) {
          break;
        }

        console.log('processing tts');
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
        console.log('processing speak');


        if((window as any).chatvrm_latency_tracker) {
          if((window as any).chatvrm_latency_tracker.active) {
            const ms = +(new Date)-(window as any).chatvrm_latency_tracker.start;
            console.log('performance_latency', ms);
            (window as any).chatvrm_latency_tracker.active = false;
          };
        }

        this.bubbleMessage('assistant', speak.screenplay.talk.message);
        if (speak.audioBuffer) {
          await this.viewer!.model?.speak(speak.audioBuffer, speak.screenplay);
        }
      } while (this.speakJobs.size() > 0);
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
      this.currentAssistantMessage += text;
      this.setUserMessage!("");
      this.setAssistantMessage!(this.currentAssistantMessage);

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
    console.log('bubbler', this.messageList)
  }

  public async interrupt() {
    this.currentStreamIdx++;
    try {
      if (this.reader) {
        console.log('cancelling')
        console.log(this.reader)
        if (! this.reader?.closed) {
          await this.reader?.cancel();
        }
        // this.reader = null;
        // this.stream = null;
        console.log('finished cancelling')
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
  public async receiveMessageFromUser(message: string) {
    console.log('receiveMessageFromUser', message)
    if (message === null || message === "") {
      return;
    }

    console.time('performance_interrupting');
    console.log('interrupting...');
    await this.interrupt();
    console.timeEnd('performance_interrupting');
    await wait(0);
    console.log('wait complete');

    this.bubbleMessage!('user', message);

    // make new stream
    const messages: Message[] = [
      { role: "system", content: config("system_prompt") },
      ...this.messageList!,
      { role: "user", content: this.currentUserMessage},
    ];
    console.log('messages', messages);

    try {
      this.streams.push(await this.getChatResponseStream(messages));
    } catch(e: any) {
      const errMsg = e.toString();
      console.error(errMsg);

      this.bubbleMessage('assistant', errMsg);
      return errMsg;
    }

    if (this.streams[this.streams.length-1] == null) {
      const errMsg = "Error: Null stream encountered.";
      console.error(errMsg);
      this.bubbleMessage('assistant', errMsg);
      return errMsg;
    }

    await this.handleChatResponseStream();

    // if last chatlog was assistant, make new chatlog message
    // otherwise append to last chatlog message
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
    const sentences = new Array<string>();

    let aiTextLog = "";
    let tag = "";
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
          console.log('performance_results', done, value);
          firstTokenEncountered = true;
        }
        if (done) break;

        receivedMessage += value;
        receivedMessage = receivedMessage.trimStart();

        // Detection of tag part of reply content
        const tagMatch = receivedMessage.match(/^\[(.*?)\]/);
        if (tagMatch && tagMatch[0]) {
          tag = tagMatch[0];
          receivedMessage = receivedMessage.slice(tag.length);
        }

        // Cut out and process the response sentence by sentence
        const sentenceMatch = receivedMessage.match(
          /^(.+[\.\!\?\n]|.{10,}[,])/,
        );
        if (sentenceMatch && sentenceMatch[0]) {
          const sentence = sentenceMatch[0];
          sentences.push(sentence);
          receivedMessage = receivedMessage
            .slice(sentence.length)
            .trimStart();

          // Skip if the string is unnecessary/impossible to utter.
          if (
            !sentence.replace(
              /^[\s\[\(\{「［（【『〈《〔｛«‹〘〚〛〙›»〕》〉』】）］」\}\)\]]+$/g,
              "",
            )
          ) {
            continue;
          }

          const aiText = `${tag} ${sentence}`;
          const aiTalks = textsToScreenplay([aiText]);
          aiTextLog += aiText;

          // Generate & play audio for each sentence, display responses
          console.log('enqueue tts', aiTalks);
          console.log('streamIdx', streamIdx, 'currentStreamIdx', this.currentStreamIdx)
          if (streamIdx !== this.currentStreamIdx) {
            console.log('wrong stream idx');
            break;
          }
          this.ttsJobs.enqueue({
            screenplay: aiTalks[0],
            streamIdx: streamIdx,
          });

          if (! firstSentenceEncountered) {
            console.timeEnd('performance_time_to_first_sentence');
            firstSentenceEncountered = true;
          }
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
    const ttsBackend = config("tts_backend");

    try {
      switch (ttsBackend) {
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
          const voice = await coqui(talk.message, voiceId);
          return voice.audio;
        }
        case 'openai': {
          const voice = await openaiTTS(talk.message);
          return voice.audio;
        }
      }
    } catch (e: any) {
      console.error(e.toString());
    }

    // ttsBackend === 'none'
    return null;
  }

  public async getChatResponseStream(messages: Message[]) {
    console.debug('getChatResponseStream', messages);
    const chatbotBackend = config("chatbot_backend");

    if (chatbotBackend === 'chatgpt') {
      return getOpenAiChatResponseStream(messages);
    }
    if (chatbotBackend === 'llamacpp') {
      return getLlamaCppChatResponseStream(messages);
    }
    if (chatbotBackend === 'windowai') {
      return getWindowAiChatResponseStream(messages);
    }

    return getEchoChatResponseStream(messages);
  }
}
