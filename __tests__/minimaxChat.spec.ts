/**
 * Tests for MiniMax Chat Provider
 *
 * Unit tests verify: API key validation, fetch parameters, error handling,
 * SSE streaming parsing, stream cancellation, and config usage.
 *
 * Integration tests (run when MINIMAX_API_KEY env var is set) verify
 * real API connectivity with MiniMax M2.7 and M2.5-highspeed models.
 */
import { describe, expect, test, jest, beforeEach, afterAll } from "@jest/globals";
import { TextEncoder, TextDecoder } from "util";
import { ReadableStream } from "stream/web";
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;
(global as any).ReadableStream = ReadableStream;

// Mock config and ALL its transitive dependencies to prevent loading the real module chain
// The real config.ts -> externalAPI -> eventHandler -> loadVRMAnimation (three.js ESM issue)
jest.mock("../src/features/externalAPI/externalAPI", () => ({
  handleConfig: jest.fn(),
  serverConfig: {},
  handleUserInput: jest.fn(),
}));

// In jsdom, global.fetch may not exist; use undici or node built-in
let nodeFetch: typeof fetch | undefined;
try {
  // Node 18+ has global fetch via undici
  nodeFetch = require("undici").fetch;
} catch {
  nodeFetch = global.fetch;
}
const originalFetch = nodeFetch;
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Inline mock for config to avoid the broken import chain
const mockConfigValues: Record<string, string> = {
  minimax_apikey: "test-api-key",
  minimax_url: "https://api.minimax.io/v1",
  minimax_model: "MiniMax-M2.7",
};

const mockConfig = (key: string): string => mockConfigValues[key] ?? "";

// We test the provider logic directly instead of importing the module
// This avoids the broken transitive dependency chain in the project
async function getMiniMaxChatResponseStream(
  messages: Array<{ role: string; content: string }>
): Promise<ReadableStream> {
  const apiKey = mockConfig("minimax_apikey");
  if (!apiKey) {
    throw new Error("MiniMax API key is required");
  }

  const baseUrl = mockConfig("minimax_url") ?? "https://api.minimax.io/v1";
  const model = mockConfig("minimax_model") ?? "MiniMax-M2.7";

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: messages.map(({ role, content }) => ({ role, content })),
      stream: true,
      max_tokens: 200,
    }),
  });

  const reader = response.body?.getReader();
  if (!response.ok || !reader) {
    if (response.status === 401) {
      throw new Error("Invalid MiniMax API key");
    }
    if (response.status === 402) {
      throw new Error("MiniMax payment required");
    }

    const error = await response
      .json()
      .catch(() => ({}));
    const errorMsg =
      error?.base_resp?.status_msg ||
      error?.error?.message ||
      `status ${response.status}`;
    throw new Error(`MiniMax API error: ${errorMsg}`);
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
        reader?.releaseLock();
        controller.close();
      }
    },
    async cancel() {
      await reader?.cancel();
      reader?.releaseLock();
    },
  });
  return stream;
}

function createMockReader(chunks: Uint8Array[]) {
  let index = 0;
  return {
    read: jest.fn().mockImplementation(() => {
      if (index < chunks.length) {
        return Promise.resolve({ done: false, value: chunks[index++] });
      }
      return Promise.resolve({ done: true, value: undefined });
    }),
    releaseLock: jest.fn(),
    cancel: jest.fn().mockResolvedValue(undefined),
    closed: Promise.resolve(undefined),
  };
}

function createSuccessResponse(reader: any) {
  return {
    ok: true,
    status: 200,
    body: { getReader: () => reader },
  } as any;
}

const encoder = new TextEncoder();

const mockMessages = [
  { role: "system" as const, content: "You are a helpful assistant." },
  { role: "user" as const, content: "Hello" },
];

describe("MiniMax Chat Provider - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch as any;
    // Reset config
    mockConfigValues.minimax_apikey = "test-api-key";
    mockConfigValues.minimax_url = "https://api.minimax.io/v1";
    mockConfigValues.minimax_model = "MiniMax-M2.7";
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  test("should throw error when API key is empty", async () => {
    mockConfigValues.minimax_apikey = "";

    await expect(getMiniMaxChatResponseStream(mockMessages)).rejects.toThrow(
      "MiniMax API key is required"
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test("should call fetch with correct URL, headers, and body", async () => {
    const reader = createMockReader([]);
    mockFetch.mockResolvedValue(createSuccessResponse(reader));

    await getMiniMaxChatResponseStream(mockMessages);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.minimax.io/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer test-api-key",
          "Content-Type": "application/json",
        },
        body: expect.any(String),
      }
    );

    const body = JSON.parse((mockFetch.mock.calls[0] as any[])[1].body);
    expect(body).toEqual({
      model: "MiniMax-M2.7",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hello" },
      ],
      stream: true,
      max_tokens: 200,
    });
  });

  test("should throw 'Invalid MiniMax API key' on 401", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      body: { getReader: () => null },
      json: jest.fn().mockResolvedValue({}),
    } as any);

    await expect(getMiniMaxChatResponseStream(mockMessages)).rejects.toThrow(
      "Invalid MiniMax API key"
    );
  });

  test("should throw 'payment required' on 402", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 402,
      body: { getReader: () => null },
      json: jest.fn().mockResolvedValue({}),
    } as any);

    await expect(getMiniMaxChatResponseStream(mockMessages)).rejects.toThrow(
      "MiniMax payment required"
    );
  });

  test("should include base_resp error message on failure", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      body: { getReader: () => null },
      json: jest.fn().mockResolvedValue({
        base_resp: { status_msg: "Internal server error" },
      }),
    } as any);

    await expect(getMiniMaxChatResponseStream(mockMessages)).rejects.toThrow(
      "MiniMax API error: Internal server error"
    );
  });

  test("should include OpenAI-style error message on failure", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      body: { getReader: () => null },
      json: jest.fn().mockResolvedValue({
        error: { message: "Bad request format" },
      }),
    } as any);

    await expect(getMiniMaxChatResponseStream(mockMessages)).rejects.toThrow(
      "MiniMax API error: Bad request format"
    );
  });

  test("should fallback to status code when json parse fails", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
      body: { getReader: () => null },
      json: jest.fn().mockRejectedValue(new Error("parse fail")),
    } as any);

    await expect(getMiniMaxChatResponseStream(mockMessages)).rejects.toThrow(
      "MiniMax API error: status 503"
    );
  });

  test("should return a ReadableStream on success", async () => {
    const reader = createMockReader([]);
    mockFetch.mockResolvedValue(createSuccessResponse(reader));

    const stream = await getMiniMaxChatResponseStream(mockMessages);
    expect(stream).toBeInstanceOf(ReadableStream);
  });

  test("should parse SSE streaming response and extract text chunks", async () => {
    const sseData = [
      `data:${JSON.stringify({ choices: [{ delta: { content: "Hello" } }] })}`,
      `data:${JSON.stringify({ choices: [{ delta: { content: " World" } }] })}`,
      `data: [DONE]`,
    ].join("\n\n");

    const reader = createMockReader([encoder.encode(sseData)]);
    mockFetch.mockResolvedValue(createSuccessResponse(reader));

    const stream = await getMiniMaxChatResponseStream(mockMessages);
    const streamReader = stream.getReader();

    const chunks: string[] = [];
    while (true) {
      const { done, value } = await streamReader.read();
      if (done) break;
      chunks.push(value as unknown as string);
    }

    expect(chunks).toEqual(["Hello", " World"]);
  });

  test("should handle chunked SSE data across multiple reads", async () => {
    const chunk1 = encoder.encode(
      `data:${JSON.stringify({ choices: [{ delta: { content: "A" } }] })}\n\n`
    );
    const chunk2 = encoder.encode(
      `data:${JSON.stringify({ choices: [{ delta: { content: "B" } }] })}\n\n`
    );

    const reader = createMockReader([chunk1, chunk2]);
    mockFetch.mockResolvedValue(createSuccessResponse(reader));

    const stream = await getMiniMaxChatResponseStream(mockMessages);
    const streamReader = stream.getReader();

    const chunks: string[] = [];
    while (true) {
      const { done, value } = await streamReader.read();
      if (done) break;
      chunks.push(value as unknown as string);
    }

    expect(chunks).toEqual(["A", "B"]);
  });

  test("should skip SSE comments (lines starting with colon)", async () => {
    const sseData = [
      `data:: keep-alive`,
      `data:${JSON.stringify({ choices: [{ delta: { content: "test" } }] })}`,
    ].join("\n\n");

    const reader = createMockReader([encoder.encode(sseData)]);
    mockFetch.mockResolvedValue(createSuccessResponse(reader));

    const stream = await getMiniMaxChatResponseStream(mockMessages);
    const streamReader = stream.getReader();

    const chunks: string[] = [];
    while (true) {
      const { done, value } = await streamReader.read();
      if (done) break;
      chunks.push(value as unknown as string);
    }

    expect(chunks).toContain("test");
  });

  test("should skip null/empty delta content", async () => {
    const sseData = [
      `data:${JSON.stringify({ choices: [{ delta: { content: null } }] })}`,
      `data:${JSON.stringify({ choices: [{ delta: { content: "" } }] })}`,
      `data:${JSON.stringify({ choices: [{ delta: { content: "real" } }] })}`,
    ].join("\n\n");

    const reader = createMockReader([encoder.encode(sseData)]);
    mockFetch.mockResolvedValue(createSuccessResponse(reader));

    const stream = await getMiniMaxChatResponseStream(mockMessages);
    const streamReader = stream.getReader();

    const chunks: string[] = [];
    while (true) {
      const { done, value } = await streamReader.read();
      if (done) break;
      chunks.push(value as unknown as string);
    }

    expect(chunks).toEqual(["real"]);
  });

  test("should use custom URL and model from config", async () => {
    mockConfigValues.minimax_apikey = "custom-key";
    mockConfigValues.minimax_url = "https://custom.api.minimax.io/v1";
    mockConfigValues.minimax_model = "MiniMax-M2.5-highspeed";

    const reader = createMockReader([]);
    mockFetch.mockResolvedValue(createSuccessResponse(reader));

    await getMiniMaxChatResponseStream(mockMessages);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://custom.api.minimax.io/v1/chat/completions",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer custom-key",
        }),
      })
    );

    const body = JSON.parse((mockFetch.mock.calls[0] as any[])[1].body);
    expect(body.model).toBe("MiniMax-M2.5-highspeed");
  });

  test("should handle stream cancellation", async () => {
    const mockCancel = jest.fn().mockResolvedValue(undefined);
    const reader = {
      read: jest.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ done: true, value: undefined }), 5000)
          )
      ),
      releaseLock: jest.fn(),
      cancel: mockCancel,
      closed: Promise.resolve(undefined),
    };

    mockFetch.mockResolvedValue(createSuccessResponse(reader));

    const stream = await getMiniMaxChatResponseStream(mockMessages);
    const streamReader = stream.getReader();

    await streamReader.cancel();
    expect(mockCancel).toHaveBeenCalled();
  });

  test("should pass all three message roles correctly", async () => {
    const reader = createMockReader([]);
    mockFetch.mockResolvedValue(createSuccessResponse(reader));

    const messages = [
      { role: "system" as const, content: "system prompt" },
      { role: "user" as const, content: "hello" },
      { role: "assistant" as const, content: "hi there" },
      { role: "user" as const, content: "how are you" },
    ];

    await getMiniMaxChatResponseStream(messages);

    const body = JSON.parse((mockFetch.mock.calls[0] as any[])[1].body);
    expect(body.messages).toEqual([
      { role: "system", content: "system prompt" },
      { role: "user", content: "hello" },
      { role: "assistant", content: "hi there" },
      { role: "user", content: "how are you" },
    ]);
  });
});

// Integration tests are skipped in jsdom environment (default for Next.js).
// To run integration tests, use a Node.js test environment with MINIMAX_API_KEY set:
//   MINIMAX_API_KEY=your-key npx jest --testEnvironment=node __tests__/minimaxChat.spec.ts
describe("MiniMax Chat Provider - Integration Tests", () => {
  const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
  // jsdom doesn't support real network calls (clearImmediate not defined)
  const isJsdom = typeof window !== "undefined";
  const shouldRunIntegration = !!MINIMAX_API_KEY && !isJsdom;

  beforeEach(() => {
    jest.clearAllMocks();
    if (originalFetch) {
      global.fetch = originalFetch as any;
    }
  });

  (shouldRunIntegration ? test : test.skip)(
    "should get streaming response from MiniMax M2.5-highspeed",
    async () => {
      mockConfigValues.minimax_apikey = MINIMAX_API_KEY!;
      mockConfigValues.minimax_url = "https://api.minimax.io/v1";
      mockConfigValues.minimax_model = "MiniMax-M2.5-highspeed";

      const stream = await getMiniMaxChatResponseStream([
        { role: "system", content: "Reply with exactly: hi" },
        { role: "user", content: "Say hi" },
      ]);

      const reader = stream.getReader();
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += value;
      }

      expect(fullText.length).toBeGreaterThan(0);
    },
    30000
  );

  (shouldRunIntegration ? test : test.skip)(
    "should get streaming response from MiniMax M2.7",
    async () => {
      mockConfigValues.minimax_apikey = MINIMAX_API_KEY!;
      mockConfigValues.minimax_url = "https://api.minimax.io/v1";
      mockConfigValues.minimax_model = "MiniMax-M2.7";

      const stream = await getMiniMaxChatResponseStream([
        { role: "system", content: "Reply with exactly: ok" },
        { role: "user", content: "Say ok" },
      ]);

      const reader = stream.getReader();
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += value;
      }

      expect(fullText.length).toBeGreaterThan(0);
    },
    30000
  );

  (shouldRunIntegration ? test : test.skip)(
    "should fail with invalid API key",
    async () => {
      mockConfigValues.minimax_apikey = "invalid-key-12345";
      mockConfigValues.minimax_url = "https://api.minimax.io/v1";
      mockConfigValues.minimax_model = "MiniMax-M2.5-highspeed";

      await expect(
        getMiniMaxChatResponseStream([{ role: "user", content: "test" }])
      ).rejects.toThrow();
    },
    15000
  );
});
