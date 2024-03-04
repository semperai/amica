import { buildVisionPrompt } from "@/utils/buildPrompt";
import { VisionBackend, VisionMessageParams } from '../vision-backend';

export class LlamaCppVisionBackend extends VisionBackend {
  async getResponse({messages, imageData}: VisionMessageParams): Promise<string>{
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Connection": "keep-alive",
      "Accept": "text/event-stream",
    };
    const prompt = buildVisionPrompt(messages);
    const opts = this.toJSON();
    opts.prompt = prompt;
    if (typeof imageData === 'string') {
      imageData = [imageData]
    }
    const image_data = imageData.map((data, id) => ({data, id}));
    opts.image_data = image_data;
    if (!opts.stop) {
      opts.stop = [
        "</s>",
        `${this.bot_name}:`,
        "User:"
      ]
    }

    const res = await fetch(`${this.url}/completion`, {
      headers: headers,
      method: "POST",
      body: JSON.stringify(opts),
    });

    if (! res.ok) {
      throw new Error(`LlamaCpp llava chat error (${res.status})`);
    }

    console.log('body', res.body);

    const reader = res.body?.getReader();
    if (res.status !== 200 || ! reader) {
      throw new Error(`LlamaCpp vision error (${res.status})`);
    }

    // Fetch the original image
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

    const sreader = await stream.getReader();

    let combined = "";
    while (true) {
      const { done, value } = await sreader.read();
      if (done) break;
      combined += value;
    }

    return combined;
    }
}

VisionBackend.registerItem(LlamaCppVisionBackend);
