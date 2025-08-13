import { Message } from "./messages";
import { config } from '@/utils/config';
import { invoke } from "@tauri-apps/api/tauri";
import { listen, Event } from "@tauri-apps/api/event";

function getApiKey(configKey: string) {
  const apiKey = config(configKey);
  if (!apiKey) {
    throw new Error(`Invalid ${configKey} API Key`);
  }
  return apiKey;
}

function getResponseStream(
  messages: Message[],
  _url: string, // url is now handled by the proxy
  model: string,
  apiKey: string,
) {
  let cleanup = () => {};

  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      const onChunk = await listen("stream-chunk", (event: Event<any>) => {
        // The OpenAI stream sends data like `data: {"id":...,"choices":[{"delta":{"content":"..."}}]}\n\n`
        // We need to parse this and extract the content.
        const chunk = event.payload.chunk;
        const lines = chunk.split('\n').filter((line: string) => line.startsWith('data: '));
        for (const line of lines) {
          const data = line.substring(6);
          if (data.trim() === '[DONE]') {
            return;
          }
          try {
            const json = JSON.parse(data);
            const messagePiece = json.choices[0].delta.content;
            if (messagePiece) {
              controller.enqueue(messagePiece);
            }
          } catch (error) {
            console.error("Failed to parse stream chunk:", error, "in chunk:", data);
          }
        }
      });

      const onError = await listen("stream-error", (event: Event<any>) => {
        console.error("Stream error from backend:", event.payload.error);
        controller.error(new Error(event.payload.error));
        cleanup();
      });

      const onEnd = await listen("stream-end", () => {
        controller.close();
        cleanup();
      });

      cleanup = () => {
        onChunk();
        onError();
        onEnd();
      };

      // Trigger the streaming request on the backend
      invoke("proxy_request_streaming", {
        payload: {
          path: "v1/chat/completions",
          authorization: apiKey,
          body: {
            model,
            messages,
            stream: true,
            max_tokens: 200,
          }
        }
      }).catch(e => {
        controller.error(new Error(`Failed to invoke streaming request: ${e}`));
        cleanup();
      });
    },
    cancel(reason) {
      console.log("Stream cancelled:", reason);
      cleanup();
    },
  });

  return stream;
}

export async function getOpenAiChatResponseStream(messages: Message[]) {
  const apiKey = getApiKey("openai_apikey");
  const url = config("openai_url");
  const model = config("openai_model");
  return getResponseStream(messages, url, model, apiKey);
}

export async function getOpenAiVisionChatResponse(messages: Message[]) {
  const apiKey = getApiKey("vision_openai_apikey");
  const model = config("vision_openai_model");

  // This is a non-streaming request.
  const json: any = await invoke("proxy_request_blocking", {
    payload: {
      path: "v1/chat/completions",
      authorization: apiKey,
      body: {
        model,
        messages,
        stream: false,
        max_tokens: 200,
      }
    }
  });

  if (json.choices && json.choices.length > 0 && json.choices[0].message) {
    return json.choices[0].message.content;
  }

  throw new Error("Invalid response structure from OpenAI compatible API");
}
