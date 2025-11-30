import { Message } from "./messages";
import { config } from '@/utils/config';

function getApiKey(configKey: string) {
  const apiKey = config(configKey);
  if (!apiKey) {
    throw new Error(`Invalid ${configKey} API Key`);
  }
  return apiKey;
}

function buildRequestBody(messages: Message[], model: string) {
  const systemMessage = messages.find((msg) => msg.role === "system");
  const conversationMessages = messages.filter((msg) => msg.role !== "system");

  const generationConfig: any = {
    maxOutputTokens: 400,
  };

  // Model version detection: check if model name contains "gemini-3"
  const isGemini3 = model.includes("gemini-3");
  const thinkingLevel = config("gemini_thinking_level");

  console.log("Gemini thinkingLevel config:", thinkingLevel, "isGemini3:", isGemini3);

  if (isGemini3) {
    // Gemini 3.0 only supports "low" or "high", cannot disable thinking
    const effectiveLevel = thinkingLevel === "off" ? "low" : thinkingLevel

    generationConfig.thinkingConfig = {
      thinkingLevel: effectiveLevel, // "low" or "high"
    };
  } else {
    // Gemini 2.5 uses thinkingBudget nested in thinkingConfig
    const isPro = model.includes("pro");

    let thinkingBudget: number;
    if (thinkingLevel === "off") {
      // Pro requires thinking (min 128), others can be 0
      thinkingBudget = isPro ? 128 : 0;
    } else if (thinkingLevel === "high") {
      thinkingBudget = -1; // Dynamic
    } else {
      // Low: consistent reasoning budget across all models
      thinkingBudget = 1024;
    }

    generationConfig.thinkingConfig = {
      thinkingBudget,
    };
  }

  const body: any = {
    contents: conversationMessages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
    generationConfig,
  };

  if (systemMessage) {
    body.systemInstruction = {
      parts: [{ text: systemMessage.content }],
    };
  }

  return body;
}

async function getResponseStream(messages: Message[]) {
  const apiKey = getApiKey("gemini_apikey");
  const model = config("gemini_model");

  const headers: Record<string, string> = {
    "x-goog-api-key": apiKey,
    "Content-Type": "application/json"
  };

  const requestBody = buildRequestBody(messages, model);
  console.log("Gemini request body:", JSON.stringify(requestBody, null, 2));

  // @todo: v1beta endpoint is subject to change, but required to support both 2.5 and 3.0 model at this time (30.11.2025)
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      headers,
      method: "POST",
      body: JSON.stringify(requestBody),
    }
  );

  const reader = res.body?.getReader();
  if (res.status !== 200 || !reader) {
    if (res.status === 401) {
      throw new Error("Invalid Gemini API key");
    }
    if (res.status === 400) {
      const errorBody = await res.text();
      throw new Error(`Invalid request to Gemini API: ${errorBody}`);
    }
    if (res.status === 403) {
      throw new Error("Gemini API access forbidden - check API key permissions");
    }
    if (res.status === 429) {
      throw new Error("Gemini API rate limit exceeded");
    }
    if (res.status >= 500) {
      throw new Error("Gemini API server error - please try again later");
    }

    throw new Error(`Gemini chat error (${res.status})`);
  }

  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      const decoder = new TextDecoder("utf-8");
      try {
        let combined = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const data = decoder.decode(value);
          const chunks = data
            .split("data:")
            .filter((val) => !!val && val.trim() !== "[DONE]");

          for (const chunk of chunks) {
            if (chunk.length > 0 && chunk[0] === ":") {
              continue;
            }
            combined += chunk;

            try {
              const json = JSON.parse(combined);
              const messagePiece = json.candidates?.[0]?.content?.parts?.[0]?.text;
              combined = "";
              if (!!messagePiece) {
                controller.enqueue(messagePiece);
              }
            } catch (error) {
              // JSON not yet complete, continue buffering
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

export async function getGeminiChatResponseStream(messages: Message[]) {
  return getResponseStream(messages);
}
