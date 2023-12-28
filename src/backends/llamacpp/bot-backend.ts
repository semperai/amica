import { buildPrompt } from "@/utils/buildPrompt";
import { CustomBotBackend } from '../custom-bot-backend';
import { Message } from '../messages';

export class LlamaCppBotBackend extends CustomBotBackend {
  async getResponseStream(messages: Message[]): Promise<ReadableStream>{
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Connection": "keep-alive",
      "Accept": "text/event-stream",
    };
    const prompt = buildPrompt(messages);
    const res = await fetch(`${this.url}/completion`, {
      headers: headers,
      method: "POST",
      body: JSON.stringify({
        stream: true,
        n_predict: 400,
        temperature: this.temperature,
        cache_prompt: true,
        stop: [
          "</s>",
          `${this.name}:`,
          "User:"
        ],
        prompt,
      }),
    });

    const reader = res.body?.getReader();
    if (res.status !== 200 || ! reader) {
      throw new Error(`LlamaCpp chat error (${res.status})`);
    }

    const stream = new ReadableStream({
      async start(controller: ReadableStreamDefaultController) {
        const decoder = new TextDecoder("utf-8");
        try {
          // sometimes the response is chunked, so we need to combine the chunks
          let combined = "";
          let cont = true;
          while (true) {
            const { done, value } = await reader.read();
            if (done || ! cont) break;
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
                if (json.stop) {
                  cont = false;
                }
                const messagePiece = json.content;
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
}

CustomBotBackend.register(LlamaCppBotBackend);
