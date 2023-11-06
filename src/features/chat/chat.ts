import { Message, Role, textsToScreenplay } from "./messages";
import { Viewer } from "@/features/vrmViewer/viewer";
import { getEchoChatResponseStream } from './echoChat';
import { getOpenAiChatResponseStream } from './openAiChat';
import { getLlamaCppChatResponseStream } from './llamaCppChat';
import { speakCharacter } from "./speakCharacter";
import { config } from '@/utils/config';

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
