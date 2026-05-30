import { Message } from "./messages";

function getLastUserMessage(messages: Message[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "user") {
      return messages[i].content;
    }
  }

  return messages[messages.length - 1]?.content ?? "";
}

export async function getDeiphobeChatResponseStream(
  messages: Message[],
): Promise<ReadableStream> {
  const text = getLastUserMessage(messages).trim();
  if (!text) {
    throw new Error("Deiphobe backend requires a user message");
  }

  console.debug("[Deiphobe] request", {
    messageCount: messages.length,
    text,
  });

  const response = await fetch("/api/deiphobeChat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      messages,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Deiphobe chat error (${response.status})`);
  }

  const reader = response.body.getReader();
  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      const decoder = new TextDecoder("utf-8");
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          if (chunk) {
            controller.enqueue(chunk);
          }
        }
      } catch (error) {
        console.error("[Deiphobe] stream error", error);
        controller.error(error);
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
    async cancel() {
      await reader.cancel();
      reader.releaseLock();
    },
  });

  return stream;
}
