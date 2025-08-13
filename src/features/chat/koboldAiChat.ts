import { Message } from "./messages";
import { buildPrompt } from "@/utils/buildPrompt";
import { config } from '@/utils/config';
import { invoke } from "@tauri-apps/api/tauri";
import { listen, Event } from "@tauri-apps/api/event";

export async function getKoboldAiChatResponseStream(messages: Message[]) {
  if (config("koboldai_use_extra") === 'true') {
    return getExtra(messages);
  } else {
    return getNormal(messages);
  }
}

// koboldcpp / stream support
function getExtra(messages: Message[]) {
  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      const onChunk = await listen("stream-chunk", (event: Event<any>) => {
        const chunk = event.payload.chunk;
        // The original stream sends data like `data: {"token": "..."}\n\n`
        // The Rust backend now sends the raw string content of the `data:` part.
        // We need to re-wrap it to match the expected format.
        const data = `data: ${chunk}\n\n`;
        controller.enqueue(data);
      });

      const onError = await listen("stream-error", (event: Event<any>) => {
        console.error("Stream error:", event.payload.error);
        controller.error(new Error(event.payload.error));
        cleanup();
      });

      const onEnd = await listen("stream-end", () => {
        controller.close();
        cleanup();
      });

      const cleanup = () => {
        onChunk();
        onError();
        onEnd();
      };

      // Trigger the streaming request on the backend
      invoke("proxy_request_streaming", {
        payload: {
          path: "api/extra/generate/stream",
          body: {
            prompt: buildPrompt(messages),
            stop_sequence: [`${config("name")}:`, ...`${config("koboldai_stop_sequence")}`.split("||")]
          }
        }
      }).catch(e => {
        controller.error(new Error(`Failed to invoke streaming request: ${e}`));
        cleanup();
      });
    },
  });

  return stream;
}

// koboldai / no stream support
async function getNormal(messages: Message[]) {
  const prompt = buildPrompt(messages);
  const stop_sequence: string[] = [`${config("name")}:`, ...`${config("koboldai_stop_sequence")}`.split("||")];

  const body = {
    prompt,
    stop_sequence,
  };

  const json: any = await invoke("proxy_request_blocking", {
    payload: {
      path: "api/v1/generate",
      body: body,
    },
  });

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
