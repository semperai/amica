import { Configuration, OpenAIApi } from "openai";
import { Message } from "../messages/messages";

export async function getChatResponse(messages: Message[]) {
  const apiKey = atob(localStorage.getItem("chatvrm_openai_apikey") ?? "");
  if (!apiKey) {
    throw new Error("Invalid API Key");
  }

  const configuration = new Configuration({
    apiKey: apiKey,
  });
  // Workaround to eliminate errors that occur when accessing the API from the browser
  // https://github.com/openai/openai-node/issues/6#issuecomment-1492814621
  delete configuration.baseOptions.headers["User-Agent"];

  const openai = new OpenAIApi(configuration);

  const { data } = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
  });

  const [aiRes] = data.choices;
  const message = aiRes.message?.content || "An error has occurred, no message data was received";

  return { message: message };
}

export async function getChatResponseStream(messages: Message[]) {
  const apiKey = atob(localStorage.getItem("chatvrm_openai_apikey") ?? "");
  if (!apiKey) {
    throw new Error("Invalid API Key");
  }
  const openaiUrl = localStorage.getItem("chatvrm_openai_url") ?? "https://api.openai.com";
  const openaiModel = localStorage.getItem("chatvrm_openai_model") ?? "gpt-3.5-turbo";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  const res = await fetch(`${openaiUrl}/v1/chat/completions`, {
    headers: headers,
    method: "POST",
    body: JSON.stringify({
      model: openaiModel,
      messages: messages,
      stream: true,
      max_tokens: 200,
    }),
  });

  const reader = res.body?.getReader();
  if (res.status !== 200 || ! reader) {
    if (res.status === 401) {
      throw new Error('Invalid OpenAI authentication');
    }

    throw new Error("Something went wrong");
  }

  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      const decoder = new TextDecoder("utf-8");
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const data = decoder.decode(value);
          const chunks = data
            .split("data:")
            .filter((val) => !!val && val.trim() !== "[DONE]");
          for (const chunk of chunks) {
            const json = JSON.parse(chunk);
            const messagePiece = json.choices[0].delta.content;
            if (!!messagePiece) {
              controller.enqueue(messagePiece);
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
