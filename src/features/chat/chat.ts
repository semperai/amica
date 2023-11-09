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
  public reader: ReadableStreamDefaultReader<Uint8Array>|null;

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

        this.bubbleMessage('assistant', speak.screenplay.talk.message);
        if (speak.audioBuffer) {
          await this.viewer!.model?.speak(speak.audioBuffer, speak.screenplay);
        }
      } while (this.speakJobs.size() > 0);
      await wait(50);
    }
  }

  public bubbleMessage(role: Role, text: string) {
    console.log('bubble setUserMessage', this.setUserMessage);
    if (role === 'user') {
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

    this.interrupt();

    this.bubbleMessage!('user', message);

    // make new stream
    const messages: Message[] = [
      { role: "system", content: config("system_prompt") },
      ...this.messageList!,
      { role: "user", content: this.currentUserMessage},
    ];
    console.log('messages', messages);

    try {
      this.stream = await this.getChatResponseStream(messages);
    } catch(e: any) {
      console.error(e);
      const errMsg = e.toString();

      this.bubbleMessage('assistant', errMsg);
      return errMsg;
    }

    if (this.stream == null) {
      const errMsg = "Error: Null stream encountered.";
      this.bubbleMessage('assistant', errMsg);
      return errMsg;
    }

    await this.handleChatResponseStream();

    // if last chatlog was assistant, make new chatlog message
    // otherwise append to last chatlog message
  }

  public async handleChatResponseStream() {
    if (! this.stream) {
      console.log('no stream!');
      return;
    }

    this.currentStreamIdx++;
    const streamIdx = this.currentStreamIdx;
    this.setChatProcessing!(true);

    console.time('chat stream processing');
    this.reader = this.stream.getReader();
    const sentences = new Array<string>();

    let aiTextLog = "";
    let receivedMessage = "";

    let firstTokenEncountered = false;
    console.time('performance_time_to_first_token');

    try {
      while (true) {
        const { done, value } = await this.reader.read();
        if (! firstTokenEncountered) {
          console.timeEnd('performance_time_to_first_token');
          firstTokenEncountered = true;
        }
        if (done) break;

        receivedMessage += value;

        let tag = "";

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
          if (streamIdx === this.currentStreamIdx) {
            this.ttsJobs.enqueue({
              screenplay: aiTalks[0],
              streamIdx: streamIdx,
            });
          } else {
            break;
          }
        }
      }
    } catch (e: any) {
      const errMsg = e.toString();
      this.bubbleMessage!('assistant', errMsg);
      console.error(e);
    } finally {
      this.reader.releaseLock();
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
          const speakerId = config('coqui_speaker_id');
          const styleUrl = config('coqui_style_url');
          const voice = await coqui(talk.message, speakerId, styleUrl);
          return voice.audio;
        }
      }
    } catch (e) {
      console.error(e);
    }

    // ttsBackend === 'none'
    return null;
  }

  public async getChatResponseStream(messages: Message[]) {
    console.log('getChatResponseStream', messages);
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
