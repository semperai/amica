import { Message } from "./messages";
import { config } from '@/utils/config';

// Token budget constants for output generation
const BASE_MAX_OUTPUT_TOKENS = 400;
const LOW_REASONING_MULTIPLIER = 3.75;
const HIGH_REASONING_MULTIPLIER = 12;
const PRO_MULTIPLIER = 1.2;
const THINKING_BUDGET_LOW = 1024;
const THINKING_BUDGET_MIN_PRO = 128;

type ThinkingLevel = "off" | "low" | "high";

interface ThinkingConfigGemini3 {
  thinkingLevel: "low" | "high";
}

interface ThinkingConfigGemini25 {
  thinkingBudget: number;
}

type ThinkingConfig = ThinkingConfigGemini3 | ThinkingConfigGemini25;

interface GenerationConfig {
  maxOutputTokens: number;
  thinkingConfig?: ThinkingConfig;
}

interface Part {
  text: string;
}

interface Content {
  role: "user" | "model";
  parts: Part[];
}

interface SystemInstruction {
  parts: Part[];
}

interface RequestBody {
  contents: Content[];
  generationConfig: GenerationConfig;
  systemInstruction?: SystemInstruction;
}

function isValidThinkingLevel(value: unknown): value is ThinkingLevel {
  return value === "off" || value === "low" || value === "high";
}

function getApiKey(configKey: string) {
  const apiKey = config(configKey);
  if (!apiKey) {
    throw new Error(`Invalid ${configKey} API Key`);
  }
  return apiKey;
}

/**
 * Calculates the maximum output tokens for Gemini API requests.
 * When reasoning is enabled, the tokens consumed by internal reasoning
 * count towards the output token limit. The multipliers account for
 * this combined budget (reasoning + text output).
 *
 * Token allocation:
 * - off: 400 (baseline, proven stable)
 * - low: 1500 (400 × 3.75, reasoning ~600-800 tokens)
 * - high: 4800 (400 × 12, reasoning 2000+ tokens)
 * - Pro models: +20% multiplier
 */
function getMaxOutputTokens(thinkingLevel: ThinkingLevel, isPro: boolean, isGemini3: boolean): number {
  const effectiveLevel = isGemini3 && thinkingLevel === "off" ? "low" : thinkingLevel;

  if (effectiveLevel === "off") {
    return BASE_MAX_OUTPUT_TOKENS;
  }

  const reasoningMultiplier = effectiveLevel === "high" ? HIGH_REASONING_MULTIPLIER : LOW_REASONING_MULTIPLIER;
  const proMultiplier = isPro ? PRO_MULTIPLIER : 1;

  return Math.round(BASE_MAX_OUTPUT_TOKENS * reasoningMultiplier * proMultiplier);
}

function buildRequestBody(messages: Message[], model: string): RequestBody {
  const systemMessages = messages.filter((msg) => msg.role === "system");
  const systemMessage = systemMessages[0];
  if (systemMessages.length > 1) {
    console.warn(`Gemini API: Multiple system messages provided (${systemMessages.length}). Only the first will be used.`);
  }

  const conversationMessages = messages.filter((msg) => msg.role !== "system");

  // Validate thinking level early
  const rawThinkingLevel = config("gemini_thinking_level");
  if (!isValidThinkingLevel(rawThinkingLevel)) {
    throw new Error(
      `Invalid gemini_thinking_level: "${rawThinkingLevel}". Must be one of: "off", "low", "high"`
    );
  }

  // Model version detection: check if model name contains "gemini-3"
  const isGemini3 = model.includes("gemini-3");
  const isPro = model.includes("pro");
  const thinkingLevel: ThinkingLevel = rawThinkingLevel;

  const generationConfig: GenerationConfig = {
    maxOutputTokens: getMaxOutputTokens(thinkingLevel, isPro, isGemini3),
  };

  if (isGemini3) {
    // Gemini 3.0 only supports "low" or "high", cannot disable thinking
    const effectiveLevel: "low" | "high" = thinkingLevel === "off" ? "low" : thinkingLevel;

    const thinkingConfig: ThinkingConfigGemini3 = {
      thinkingLevel: effectiveLevel,
    };
    generationConfig.thinkingConfig = thinkingConfig;
  } else {
    // Gemini 2.5 uses thinkingBudget nested in thinkingConfig
    let thinkingBudget: number;
    if (thinkingLevel === "off") {
      // Pro requires thinking (min budget), others can be 0
      thinkingBudget = isPro ? THINKING_BUDGET_MIN_PRO : 0;
    } else if (thinkingLevel === "high") {
      thinkingBudget = -1; // Dynamic
    } else {
      // Low: consistent reasoning budget across all models
      thinkingBudget = THINKING_BUDGET_LOW;
    }

    const thinkingConfig: ThinkingConfigGemini25 = {
      thinkingBudget,
    };
    generationConfig.thinkingConfig = thinkingConfig;
  }

  const contents: Content[] = conversationMessages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const body: RequestBody = {
    contents,
    generationConfig,
  };

  if (systemMessage) {
    const systemInstruction: SystemInstruction = {
      parts: [{ text: systemMessage.content }],
    };
    body.systemInstruction = systemInstruction;
  }

  return body;
}

async function getResponseStream(messages: Message[]): Promise<ReadableStream<string>> {
  const apiKey = getApiKey("gemini_apikey");
  const model = config("gemini_model");

  const headers: Record<string, string> = {
    "x-goog-api-key": apiKey,
    "Content-Type": "application/json"
  };

  const requestBody = buildRequestBody(messages, model);

  // @todo: v1beta endpoint is subject to change, but required to support both 2.5 and 3.0 model at this time (30.11.2025)
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      headers,
      method: "POST",
      body: JSON.stringify(requestBody),
    }
  );

  // Check status before calling getReader() to avoid locking the stream
  if (res.status !== 200) {
    const errorBody = await res.text();
    if (res.status === 401) {
      throw new Error("Invalid Gemini API key");
    }
    if (res.status === 400) {
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
    throw new Error(`Gemini chat error (${res.status}): ${errorBody}`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("Gemini API response has no readable stream");
  }

  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      const decoder = new TextDecoder("utf-8");
      const MAX_BUFFER_SIZE = 100000;
      let parseErrorCount = 0;
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

            // Detect malformed payloads
            if (combined.length > MAX_BUFFER_SIZE) {
              console.error(`Gemini parser: buffer exceeded ${MAX_BUFFER_SIZE} bytes, likely malformed payload`);
              throw new Error("Gemini API response payload too large - possible malformed JSON");
            }

            try {
              const json = JSON.parse(combined);
              const messagePiece = json.candidates?.[0]?.content?.parts?.[0]?.text;
              combined = "";
              parseErrorCount = 0;
              if (!!messagePiece) {
                controller.enqueue(messagePiece);
              }
            } catch (error) {
              // JSON not yet complete, continue buffering
              parseErrorCount++;
              if (parseErrorCount > 10 && combined.length > 1000) {
                console.error(`Gemini parser: repeated parse failures on buffer, payload may be malformed`);
              }
            }
          }
        }
      } catch (error) {
        console.error(error);
        controller.error(error);
      } finally {
        if (reader) {
          reader.releaseLock();
        }
        controller.close();
      }
    },
    async cancel() {
      if (reader) {
        await reader.cancel();
      }
    },
  });

  return stream;
}

export async function getGeminiChatResponseStream(messages: Message[]): Promise<ReadableStream<string>> {
  return getResponseStream(messages);
}
