/**
 * @jest-environment node
 */
import { afterEach, beforeAll, describe, expect, jest, test } from "@jest/globals";

jest.mock("../src/utils/config", () => ({
  config: (key: string) => (key === "requesty_apikey" ? "test-key" : null),
}));

type RequestyChat = typeof import("../src/features/chat/requestyChat");
let getRequestyChatResponseStream: RequestyChat["getRequestyChatResponseStream"];
let parseRequestyStreamEvent: RequestyChat["parseRequestyStreamEvent"];

beforeAll(async () => {
  // imported after jest.mock so the config mock is in place
  ({ getRequestyChatResponseStream, parseRequestyStreamEvent } = await import("../src/features/chat/requestyChat"));
});

const originalFetch = global.fetch;

function mockStreamResponse(parts: string[]) {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const part of parts) {
        controller.enqueue(encoder.encode(part));
      }
      controller.close();
    },
  });
  global.fetch = (async () =>
    new Response(body, {
      status: 200,
      headers: { "Content-Type": "text/event-stream" },
    })) as typeof fetch;
}

async function readAll(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += value;
  }
  return text;
}

function event(content: string): string {
  return `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`;
}

afterEach(() => {
  global.fetch = originalFetch;
  jest.restoreAllMocks();
});

describe("Requesty chat stream", () => {
  test("joins events split at any byte boundary", async () => {
    const raw = ": keep alive\n\n" + event("Hello") + event(" there") + "data: [DONE]\n\n";
    for (let cut = 1; cut < raw.length; cut++) {
      mockStreamResponse([raw.slice(0, cut), raw.slice(cut)]);
      const stream = await getRequestyChatResponseStream([]);
      await expect(readAll(stream)).resolves.toBe("Hello there");
    }
  });

  test("handles one byte per read and CRLF line endings", async () => {
    const raw = (event("a") + event("b") + "data: [DONE]\n\n").replace(/\n/g, "\r\n");
    mockStreamResponse(raw.split(""));
    const stream = await getRequestyChatResponseStream([]);
    await expect(readAll(stream)).resolves.toBe("ab");
  });

  test("errors the stream on a malformed event", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockStreamResponse([event("ok"), "data: {not json\n\n"]);
    const stream = await getRequestyChatResponseStream([]);
    await expect(readAll(stream)).rejects.toThrow("not valid JSON");
  });

  test("errors the stream when the body is not SSE", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockStreamResponse(["<html>oops</html>"]);
    const stream = await getRequestyChatResponseStream([]);
    await expect(readAll(stream)).rejects.toThrow("without any data");
  });
});

describe("parseRequestyStreamEvent", () => {
  test("returns the delta content", () => {
    expect(parseRequestyStreamEvent('{"choices":[{"delta":{"content":"hi"}}]}')).toBe("hi");
  });

  test("allows chunks without content", () => {
    expect(parseRequestyStreamEvent('{"choices":[{"delta":{},"finish_reason":"stop"}]}')).toBeUndefined();
    expect(parseRequestyStreamEvent('{"choices":[],"usage":{"total_tokens":3}}')).toBeUndefined();
  });

  test("throws on error events and unexpected shapes", () => {
    expect(() => parseRequestyStreamEvent('{"error":{"message":"rate limited"}}')).toThrow("Requesty error: rate limited");
    expect(() => parseRequestyStreamEvent('{"foo":1}')).toThrow("without choices");
  });
});
