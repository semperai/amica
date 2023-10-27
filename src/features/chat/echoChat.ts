import { Configuration, OpenAIApi } from "openai";
import { Message } from "@/features/messages/messages";

export async function getEchoChatResponseStream(messages: Message[]) {
  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      try {
        let lastMessage = messages[messages.length - 1].content;
        const lastChar = lastMessage.length > 0 ? lastMessage[lastMessage.length - 1] : ' ';
        if (lastChar !== '.' && lastChar !== '?' && lastChar !== '!') {
          lastMessage += ".";
        }
        controller.enqueue(lastMessage);
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return stream;
}

