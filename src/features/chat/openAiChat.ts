import { Message } from "./messages";
import { config } from '@/utils/config';

interface OpenAIChoice {
  message: {
    content: string;
  };
}

interface OpenAIResponse {
  choices: OpenAIChoice[];
}

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
      const unlistens: Array<() => void> = [];
      cleanup = () => unlistens.forEach(fn => fn());

      const onChunk = (chunk: string) => {
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
      };

      const onEnd = () => {
        controller.close();
        cleanup();
      };

      const onError = (error: string) => {
        console.error("Stream error from backend:", error);
        controller.error(new Error(error));
        cleanup();
      };

      try {
        window.electronAPI.proxyRequestStreaming({
          path: "v1/chat/completions",
          authorization: apiKey,
          body: JSON.stringify({
            model,
            messages,
            stream: true,
            max_tokens: 200,
          }),
        }, onChunk, onEnd, onError);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        controller.error(new Error(`Failed to invoke streaming request: ${msg}`));
        cleanup();
      }
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

export async function getOpenAiVisionChatResponse(messages: Message[]): Promise<string> {
  const apiKey = getApiKey("vision_openai_apikey");
  const model = config("vision_openai_model");

  let json: OpenAIResponse;
  try {
    // This is a non-streaming request.
    const res = await window.electronAPI.proxyRequestBlocking({
      path: "v1/chat/completions",
      authorization: apiKey,
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        max_tokens: 200,
      }),
    });
    json = JSON.parse(res);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`OpenAI proxy request failed: ${msg}`);
  }


  if (json.choices && json.choices.length > 0 && json.choices[0].message && json.choices[0].message.content) {
    return json.choices[0].message.content;
  }

  throw new Error("Invalid response structure from OpenAI-compatible API");
}
