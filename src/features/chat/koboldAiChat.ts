import { Message } from "./messages";
import { buildPrompt } from "@/utils/buildPrompt";
import { config } from '@/utils/config';

export async function getKoboldAiChatResponseStream(messages: Message[]) {
  if (config("koboldai_use_extra") === 'true') {
    return getExtra(messages);
  } else {
    return getNormal(messages);
  }
}

// koboldcpp / stream support
async function getExtra(messages: Message[]) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const prompt = buildPrompt(messages);

  const res = await fetch(`${config("koboldai_url")}/api/extra/generate/stream`, {
    headers: headers,
    method: "POST",
    body: JSON.stringify({
      prompt,
    }),
  });

  const reader = res.body?.getReader();
  if (res.status !== 200 || ! reader) {
    throw new Error(`KoboldAi chat error (${res.status})`);
  }

  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      const decoder = new TextDecoder("utf-8");
      try {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value);

          let eolIndex;
          while ((eolIndex = buffer.indexOf('\n')) >= 0) {
            const line = buffer.substring(0, eolIndex).trim();
            buffer = buffer.substring(eolIndex + 1);

            if (line.startsWith('data:')) {
              try {
                const json = JSON.parse(line.substring(5));
                const messagePiece = json.token;
                if (messagePiece) {
                  controller.enqueue(messagePiece);
                }
              } catch (error) {
                console.error("JSON parsing error:", error, "in line:", line);
              }
            }
          }
        }
      } catch (error) {
        console.error("Stream error:", error);
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

// koboldai / no stream support
async function getNormal(messages: Message[]) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const prompt = buildPrompt(messages);

  const res = await fetch(`${config("koboldai_url")}/api/v1/generate`, {
    headers: headers,
    method: "POST",
    body: JSON.stringify({
      prompt,
    }),
  });

  const json = await res.json();
  if (json.results.length === 0) {
    throw new Error(`KoboldAi result length 0`);
  }

  const text = json.results.map((row: {text: string}) => row.text).join('');

  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      try {
        text.split(' ').map((word: string) => word + ' ').forEach((word: string) => {
          controller.enqueue(word);
        });
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return stream;
}
