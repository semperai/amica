import { Message, Screenplay } from "@/features/chat/messages";
import { Chat } from "@/features/chat/chat";

import { getEchoChatResponseStream } from "@/features/chat/echoChat";
import { getOpenAiChatResponseStream } from "@/features/chat/openAiChat";
import { getLlamaCppChatResponseStream, getLlavaCppChatResponse } from "@/features/chat/llamaCppChat";
import { getWindowAiChatResponseStream } from "@/features/chat/windowAiChat";
import { getOllamaChatResponseStream, getOllamaVisionChatResponse } from "@/features/chat/ollamaChat";
import { getKoboldAiChatResponseStream } from "@/features/chat/koboldAiChat";

import { config } from "@/utils/config";
import { processResponse } from "@/utils/processResponse";

// Function to ask llm with custom system prompt, if doesn't want it to speak provide the chat in params as null.
export async function askLLM(
  systemPrompt: string,
  userPrompt: string,
  chat: Chat | null,
): Promise<string> {
  let streams = [];
  let readers = [];
  let currentStreamIdx = 0
  let setChatProcessing = (_processing: boolean) => {};

  chat === null ? currentStreamIdx = 0 : null;

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
    const errMsg = `Error: ${e.toString()}`;
    console.error(errMsg);
    alert.error("Failed to get LLM response", errMsg);
    return errMsg;
  }

  const stream = streams[streams.length - 1];
  if (!stream) {
    const errMsg = "Error: Null LLM stream encountered.";
    console.error(errMsg);
    alert.error("Null LLM stream encountered", errMsg);
    return errMsg;
  }

  if (streams.length === 0) {
    console.log("No stream!");
    return "Error: No stream";
  }

  currentStreamIdx++;
  chat !== null ? currentStreamIdx = chat.currentStreamIdx : null;
  setChatProcessing(true);

  console.time("LLM stream processing");
  const reader = stream.getReader();
  readers.push(reader);
  let receivedMessage = "";
  let sentences = new Array<string>();
  let aiTextLog = "";
  let tag = "";
  let isThinking = false;
  let rolePlay = "";
  let result = "";

  let firstTokenEncountered = false;
  let firstSentenceEncountered = false;
  console.time('performance_time_to_first_token');
  chat !== null ? console.time('performance_time_to_first_sentence') : null ;

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
      

      if (chat !== null) {
        const proc = processResponse({
          sentences,
          aiTextLog,
          receivedMessage,
          tag,
          isThinking,
          rolePlay,
          callback: (aiTalks: Screenplay[]): boolean => {
            // Generate & play audio for each sentence, display responses
            if (currentStreamIdx !== chat.currentStreamIdx) {
              console.log('wrong stream idx');
              return true; // should break
            }
            if (!isThinking) {
              chat.ttsJobs.enqueue({
                screenplay: aiTalks[0],
                streamIdx: currentStreamIdx,
              });
            }

            // thought bubble
            chat.thoughtBubbleMessage(isThinking, aiTalks[0].text);
  
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
        isThinking = proc.isThinking;
        rolePlay = proc.rolePlay;
        if (proc.shouldBreak) {
          break;
        }  
      }
      
    }
  } catch (e: any) {
    const errMsg = e.toString();
    console.error(errMsg);
  } finally {
    if (!reader.closed) {
      reader.releaseLock();
    }
    console.timeEnd("LLM stream processing");
    if (currentStreamIdx === currentStreamIdx) {
      setChatProcessing(false);
    }
  }
  chat !== null ? result = aiTextLog : result = receivedMessage;
  return result;
}

export async function askVisionLLM(
  imageData: string,
): Promise<string> {
  try {
    const visionBackend = config("vision_backend");

    console.debug("vision_backend", visionBackend);

    const messages: Message[] = [
      { role: "system", content: config("vision_system_prompt") },
      {
        role: 'user',
        content: "Describe the image as accurately as possible"
      },
    ];

    let res = "";
    if (visionBackend === "vision_llamacpp") {
      res = await getLlavaCppChatResponse(messages, imageData);
    } else if (visionBackend === "vision_ollama") {
      res = await getOllamaVisionChatResponse(messages, imageData);
    } else {
      console.warn("vision_backend not supported", visionBackend);
      return "vision_backend not supported";
    }

    let content =  `This is a picture I just took from my webcam (described between [[ and ]] ): [[${res}]] Please respond accordingly and as if it were just sent and as though you can see it.`
    const result = await askLLM(config("system_prompt"),content,null);

    return result;
  } catch (e: any) {
    console.error("getVisionResponse", e.toString());
    // alert?.error("Failed to get vision response", e.toString());
    return "Failed to get vision response";
  }
}

export default askLLM;
