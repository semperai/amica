import { Message } from "./messages";
import { config } from '@/utils/config';

export async function getKoboldAiChatResponseStream(messages: Message[]) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  let prompt = "";
  for (let m of messages) {
    switch(m.role) {
      case 'system':
        prompt += config("system_prompt")+"\n\n";
        break;
      case 'user':
        prompt += `User: ${m.content}\n`;
        break;
      case 'assistant':
        prompt += `Amica: ${m.content}\n`;
        break;
    }
  }
  prompt += "Amica:";
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
