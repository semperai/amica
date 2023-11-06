import { Message } from "./messages";
import { getEchoChatResponseStream } from './echoChat';
import { getOpenAiChatResponseStream } from './openAiChat';
import { getLlamaCppChatResponseStream } from './llamaCppChat';
import { config } from '@/utils/config';

export async function getChatResponseStream(messages: Message[]) {
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
