import { Message } from "./messages";
import { buildPrompt } from "@/utils/buildPrompt";
import { config } from '@/utils/config';

export async function getOllamaChatResponseStream(messages: Message[]) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const res = await fetch(`${config("ollama_url")}/api/chat`, {
    headers: headers,
    method: "POST",
    body: JSON.stringify({
      model: config("ollama_model"),
      messages,
    }),
  });

  const reader = res.body?.getReader();
  if (res.status !== 200 || ! reader) {
    throw new Error(`Ollama chat error (${res.status})`);
  }

  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      const decoder = new TextDecoder("utf-8");
      try {
        // Ollama sends chunks of multiple complete JSON objects separated by newlines
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const data = decoder.decode(value);
          const jsonResponses = data
            .trim() // Ollama sends an empty line after the final JSON message...
            .split("\n")
            //.filter((val) => !!val) 

          for (const jsonResponse of jsonResponses) {
            try {
              const json = JSON.parse(jsonResponse);
              const messagePiece = json.message.content;
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

export async function getOllamaVisionChatResponse(messages: Message[], imageData: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const res = await fetch(`${config("vision_ollama_url")}/api/chat`, {
    headers: headers,
    method: "POST",
    body: JSON.stringify({
      model: config("vision_ollama_model"),
      messages,
      images: [imageData],
      stream: false,
    }),
  });

  if (res.status !== 200) {
    throw new Error(`Ollama chat error (${res.status})`);
  }

  const json = await res.json();
  return json.response;
}
