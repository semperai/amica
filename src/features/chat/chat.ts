import { Message } from "@/features/messages/messages";
import { getEchoChatResponseStream } from './echoChat';
import { getOpenAiChatResponseStream } from './openAiChat';

export async function getChatResponseStream(messages: Message[]) {
  const chatbotBackend = localStorage.getItem("chatvrm_chatbot_backend") ?? "echo";

  if (chatbotBackend === 'chatgpt') {
    return getOpenAiChatResponseStream(messages);
  }

  return getEchoChatResponseStream(messages);
}
