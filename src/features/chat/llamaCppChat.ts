import { Configuration, OpenAIApi } from "openai";
import { Message } from "./messages";
import { config } from '@/utils/config';

export async function getLlamaCppChatResponseStream(messages: Message[]) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Connection": "keep-alive",
    "Accept": "text/event-stream",
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
  console.log('Prompt', prompt);

  const res = await fetch(`${config("llamacpp_url")}/completion`, {
    headers: headers,
    method: "POST",
    body: JSON.stringify({
      stream: true,
      n_predict: 400,
      temperature: 0.7,
      cache_prompt: true,
      stop: [
        "</s>",
        "Amica:",
        "User:"
      ],
      prompt,
    }),
  });

  const reader = res.body?.getReader();
  if (res.status !== 200 || ! reader) {
    throw new Error("Something went wrong");
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
        controller.error(error);
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });

  return stream;
}