import { Message } from "./messages";
import { Output } from "window.ai";
import { config } from "@/utils/config";


export async function getWindowAiChatResponseStream(messages: Message[]) {
  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      try {
        const [response]: Output[] = await window.ai.generateText({
          messages,
        }, {
          maxTokens: 400,
          temperature: 0.7,
          stopSequences: [
            "</s>",
            `${config('name')}:`,
            "User:"
          ],
          onStreamResult: (res: Output | null, error: string | null): void => {
            if (res === null) {
              throw new Error("null result from window.ai");
            }

            if (error) {
              throw new Error(error);
            }

            // @ts-ignore
            const piece = res.message?.content;
            if (!! piece) {
              controller.enqueue(piece);
            }

            return;
          },
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
