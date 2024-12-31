import { Message } from "./messages";
import { config } from '@/utils/config';

function getApiKey(configKey: string) {
  const apiKey = config(configKey);
  if (!apiKey) {
    throw new Error(`Invalid ${configKey} API Key`);
  }
  return apiKey;
}

async function getResponseStream(
  messages: Message[],
  url: string,
  model: string,
  apiKey: string,
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
    "HTTP-Referer": "https://amica.arbius.ai",
    "X-Title": "Amica",
  };

  const res = await fetch(`${url}/v1/chat/completions`, {
    headers: headers,
    method: "POST",
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_tokens: 200,
    }),
  });

  const reader = res.body?.getReader();
  if (res.status !== 200 || ! reader) {
    if (res.status === 401) {
      throw new Error('Invalid OpenAI authentication');
    }
    if (res.status === 402) {
      throw new Error('Payment required');
    }

    throw new Error(`OpenAI chat error (${res.status})`);
  }

  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      const decoder = new TextDecoder("utf-8");
      try {
        // sometimes the response is chunked, so we need to combine the chunks
        let combined = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const data = decoder.decode(value);
          const chunks = data
            .split("data:")
            .filter((val) => !!val && val.trim() !== "[DONE]");

          for (const chunk of chunks) {
            // skip comments
            if (chunk.length > 0 && chunk[0] === ":") {
              continue;
            }
            combined += chunk;

            try {
              const json = JSON.parse(combined);
              const messagePiece = json.choices[0].delta.content;
              combined = "";
              if (!!messagePiece) {
                controller.enqueue(messagePiece);
              }
            } catch (error) {
              console.error(error);
            }
          }
        }
      } catch (error) {
        console.error(error);
        controller.error(error);
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
    async cancel() {
      await reader?.cancel();
      reader.releaseLock();
    }
  });

  return stream;
}

export async function getOpenAiChatResponseStream(messages: Message[]) {
  const apiKey = getApiKey("openai_apikey");
  const url = config("openai_url");
  const model = config("openai_model");
  return getResponseStream(messages, url, model, apiKey);
}

export async function getOpenAiVisionChatResponse(messages: Message[],) {
  const apiKey = getApiKey("vision_openai_apikey");
  const url = config("vision_openai_url");
  const model = config("vision_openai_model");

  const stream = await getResponseStream(messages, url, model, apiKey);
  const sreader = await stream.getReader();

  let combined = "";
  while (true) {
    const { done, value } = await sreader.read();
    if (done) break;
    combined += value;
  }

  return combined;
}
