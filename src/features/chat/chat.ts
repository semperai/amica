import { Message, Role, Screenplay, Talk, textsToScreenplay } from "./messages";
import { Viewer } from "@/features/vrmViewer/viewer";

import { getEchoChatResponseStream } from './echoChat';
import { getOpenAiChatResponseStream } from './openAiChat';
import { getLlamaCppChatResponseStream } from './llamaCppChat';

import { elevenlabs } from "@/features/elevenlabs/elevenlabs";
import { coqui } from "@/features/coqui/coqui";
import { speecht5 } from "@/features/speecht5/speecht5";
import { config } from "@/utils/config";

import { wait } from "@/utils/wait";


function createSpeakCharacter() {
  let lastTime = 0;
  let prevFetchPromise: Promise<unknown> = Promise.resolve();
  let prevSpeakPromise: Promise<unknown> = Promise.resolve();

  return (
    screenplay: Screenplay,
    viewer: Viewer,
    onStart?: () => void,
    onComplete?: () => void
  ) => {
    const fetchPromise = prevFetchPromise.then(async () => {
      const now = Date.now();
      if (now - lastTime < 1000) {
        await wait(1000 - (now - lastTime));
      }

      const buffer = await fetchAudio(screenplay.talk).catch(
        () => null
      );
      lastTime = Date.now();
      return buffer;
    });

    prevFetchPromise = fetchPromise;
    prevSpeakPromise = Promise.all([fetchPromise, prevSpeakPromise]).then(
      ([audioBuffer]) => {
        onStart?.();
        if (!audioBuffer) {
          return;
        }
        return viewer.model?.speak(audioBuffer, screenplay);
      }
    );
    prevSpeakPromise.then(() => {
      onComplete?.();
    });
  };
};

const speakCharacter = createSpeakCharacter();

async function fetchAudio(talk: Talk): Promise<ArrayBuffer> {
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
  return new ArrayBuffer(0);
}

async function getChatResponseStream(messages: Message[]) {
  console.log('getChatResponseStream', messages);
  const chatbotBackend = config("chatbot_backend");

  if (chatbotBackend === 'chatgpt') {
    return getOpenAiChatResponseStream(messages);
  }
  if (chatbotBackend === 'llamacpp') {
    return getLlamaCppChatResponseStream(messages);
  }

  return getEchoChatResponseStream(messages);
}

async function handleChatResponseStream(
  stream: ReadableStream<Uint8Array>,
  viewer: Viewer,
  bubbleMessage: (role: Role, message: string, processing: boolean) => void,
) {
  console.time('chat stream processing');
  const reader = stream.getReader();
  const sentences = new Array<string>();

  let aiTextLog = "";
  let receivedMessage = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
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
        const currentAssistantMessage = sentences.join(" ");

        speakCharacter(
          aiTalks[0],
          viewer,
          () => {
            bubbleMessage('assistant', currentAssistantMessage, true);
          },
          () => {
          }
        );
      }
    }
  } catch (e: any) {
    const errMsg = e.toString();
    bubbleMessage('assistant', errMsg, false);
    console.error(e);
  } finally {
    reader.releaseLock();
    console.timeEnd('chat stream processing');
  }

  return aiTextLog;
}

export async function chat(
  messageLog: Message[],
  viewer: Viewer,
  bubbleMessage: (role: Role, message: string, processing: boolean) => void,
  setChatLog: (messageLog: Message[]) => void,
): Promise<string> {
  let stream = null;

  // Chat GPTへ
  const messages: Message[] = [
    {
      role: "system",
      content: config("system_prompt"),
    },
    ...messageLog,
  ];

  try {
    stream = await getChatResponseStream(messages);
  } catch(e: any) {
    console.error(e);
    const errMsg = e.toString();

    bubbleMessage('assistant', errMsg, false);
    setChatLog([
      ...messageLog,
      { role: "assistant", content: errMsg },
    ]);
    return errMsg;
  }

  if (stream == null) {
    const errMsg = "Error: Null stream encountered.";
    bubbleMessage('assistant', errMsg, false);
    setChatLog([
      ...messageLog,
      { role: "assistant", content: errMsg },
    ]);
    return errMsg;
  }

  const aiTextLog = await handleChatResponseStream(
    stream,
    viewer,
    bubbleMessage,
  );

  return aiTextLog;
}
