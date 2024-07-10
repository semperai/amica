import { Message } from "@/features/chat/messages";
import { config } from "@/utils/config";

import { getEchoChatResponseStream } from "@/features/chat/echoChat";
import { getOpenAiChatResponseStream } from "@/features/chat/openAiChat";
import { getLlamaCppChatResponseStream } from "@/features/chat/llamaCppChat";
import { getWindowAiChatResponseStream } from "@/features/chat/windowAiChat";
import { getOllamaChatResponseStream } from "@/features/chat/ollamaChat";
import { getKoboldAiChatResponseStream } from "@/features/chat/koboldAiChat";

// Function to ask llm without its speaking
export async function askLLM(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  let streams = [];
  let currentStreamIdx = 0;
  let readers = [];
  let setChatProcessing = (_processing: boolean) => {};

  const alert = {
    error: (title: string, message: string) => {
      console.error(`${title}: ${message}`);
    },
  };
  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  // Function to simulate fetching chat response stream based on the selected backend
  const getChatResponseStream = async (messages: Message[]) => {
    console.debug("getChatResponseStream", messages);
    const chatbotBackend = config("chatbot_backend");

    switch (chatbotBackend) {
      case "chatgpt":
        return getOpenAiChatResponseStream(messages);
      case "llamacpp":
        return getLlamaCppChatResponseStream(messages);
      case "windowai":
        return getWindowAiChatResponseStream(messages);
      case "ollama":
        return getOllamaChatResponseStream(messages);
      case "koboldai":
        return getKoboldAiChatResponseStream(messages);
      default:
        return getEchoChatResponseStream(messages);
    }
  };

  try {
    streams.push(await getChatResponseStream(messages));
  } catch (e: any) {
    const errMsg = e.toString();
    console.error(errMsg);
    alert.error("Failed to get subconcious subroutine response", errMsg);
    return errMsg;
  }

  const stream = streams[streams.length - 1];
  if (!stream) {
    const errMsg = "Error: Null subconcious subroutine stream encountered.";
    console.error(errMsg);
    alert.error("Null subconcious subroutine stream encountered", errMsg);
    return errMsg;
  }

  if (streams.length === 0) {
    console.log("No stream!");
    return "";
  }

  currentStreamIdx++;
  setChatProcessing(true);

  console.time("Subconcious subroutine stream processing");
  const reader = stream.getReader();
  readers.push(reader);
  let receivedMessage = "";

  let firstTokenEncountered = false;
  console.time("performance_time_to_first_token");

  try {
    while (true) {
      if (currentStreamIdx !== currentStreamIdx) {
        console.log("Wrong stream idx");
        break;
      }
      const { done, value } = await reader.read();
      if (!firstTokenEncountered) {
        console.timeEnd("performance_time_to_first_token");
        firstTokenEncountered = true;
      }
      if (done) break;

      receivedMessage += value;
      receivedMessage = receivedMessage.trimStart();
    }
  } catch (e: any) {
    const errMsg = e.toString();
    console.error(errMsg);
  } finally {
    if (!reader.closed) {
      reader.releaseLock();
    }
    console.timeEnd("Subconcious subroutine stream processing");
    if (currentStreamIdx === currentStreamIdx) {
      setChatProcessing(false);
    }
  }

  return receivedMessage;
}

export default askLLM;
