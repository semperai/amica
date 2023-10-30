import { Message } from "@/features/messages/messages";
import { getEchoChatResponseStream } from './echoChat';
import { getOpenAiChatResponseStream } from './openAiChat';
import { config } from '@/utils/config';

export async function getChatResponseStream(messages: Message[]) {
  console.log('getChatResponseStream', messages);
  const chatbotBackend = config("chatbot_backend");

  if (chatbotBackend === 'chatgpt') {
    return getOpenAiChatResponseStream(messages);
  }

  return getEchoChatResponseStream(messages);
}
