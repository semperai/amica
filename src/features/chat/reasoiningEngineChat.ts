import { log } from "console";
import { Message } from "./messages";
import { config } from "@/utils/config";

export async function getReasoingEngineChatResponseStream(
  systemPrompt: Message,
  messages: Message[],
) {
  const response = await fetch(config("reasoning_engine_url"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemPrompt: systemPrompt,
        messages: messages,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Reasoning server responded with status ${response.status}: ${response.statusText}`,
    );
  }

  const reader = response.body?.getReader();
  if (response.status !== 200 || !reader) {
    throw new Error(`Reasoing engine error (${response.status})`);
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
    },
  });

  return stream;
}
