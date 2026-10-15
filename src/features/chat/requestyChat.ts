import { Message } from './messages';
import { config } from '@/utils/config';

/**
 * Gets a streaming chat response from Requesty API.
 * Requesty provides an OpenAI-compatible API with access to multiple models.
 */
export async function getRequestyChatResponseStream(messages: Message[]): Promise<ReadableStream> {
  const apiKey = config('requesty_apikey');
  if (!apiKey) {
    throw new Error('Requesty API key is required');
  }

  const baseUrl = config('requesty_url') ?? 'https://router.requesty.ai/v1';
  const model = config('requesty_model') ?? 'openai/gpt-4o-mini';
  const appUrl = 'https://amica.arbius.ai';

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': appUrl,
      'X-Title': 'Amica Chat'
    },
    body: JSON.stringify({
      model,
      messages: messages.map(({ role, content }) => ({ role, content })),
      stream: true
    })
  });

  if (!response.ok) {
    let message = `Requesty request failed with status ${response.status}`;
    try {
      const error = await response.json();
      // Handle Requesty-specific error format
      if (error.error?.message) {
        message = `Requesty error: ${error.error.message}`;
      }
    } catch {
      // error body was not JSON, keep the status based message
    }
    throw new Error(message);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Requesty response has no body');
  }

  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      const decoder = new TextDecoder("utf-8");
      // a read can end anywhere inside an SSE record, so keep the unfinished
      // line between reads and only parse complete events
      let buffer = "";
      let dataLines: string[] = [];
      let sawData = false;
      let finished = false;
      let readerDone = false;

      const dispatchEvent = () => {
        if (dataLines.length === 0) {
          return;
        }
        const data = dataLines.join("\n");
        dataLines = [];
        if (data.trim() === "[DONE]") {
          finished = true;
          return;
        }
        const messagePiece = parseRequestyStreamEvent(data);
        // only a parsed event counts as data, a bare [DONE] is still an empty reply
        sawData = true;
        if (messagePiece) {
          controller.enqueue(messagePiece);
        }
      };

      const handleLine = (line: string) => {
        if (line === "") {
          // a blank line ends the current event
          dispatchEvent();
        } else if (line.startsWith("data:")) {
          dataLines.push(line.slice(5).trimStart());
        }
        // comments (":") and other SSE fields are ignored
      };

      try {
        while (!finished) {
          const { done, value } = await reader.read();
          readerDone = done;
          buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
          // a trailing \r may be the first half of a CRLF split across reads,
          // so hold it back until the next read shows what follows
          const carry = !done && buffer.endsWith("\r") ? "\r" : "";
          const lines = (carry ? buffer.slice(0, -1) : buffer).split(/\r\n|\r|\n/);
          buffer = done ? "" : (lines.pop() ?? "") + carry;
          for (const line of lines) {
            handleLine(line);
            if (finished) break;
          }
          if (done) {
            dispatchEvent();
            break;
          }
        }
        if (!sawData) {
          throw new Error('Requesty stream ended without any data');
        }
        controller.close();
      } catch (error) {
        console.error(error);
        controller.error(error);
      } finally {
        if (!readerDone) {
          // stopped before EOF ([DONE] or an error), so close the connection too
          try {
            await reader.cancel();
          } catch {
            // nothing more to do if the body is already gone
          }
        }
        reader.releaseLock();
      }
    },
    async cancel() {
      await reader?.cancel();
      reader?.releaseLock();
    }
  });
  return stream;
}

/**
 * Parses the data of one Requesty stream event and returns its text delta.
 * Throws on malformed events so the caller sees the failure instead of an empty reply.
 */
export function parseRequestyStreamEvent(data: string): string | undefined {
  let json: any;
  try {
    json = JSON.parse(data);
  } catch {
    throw new Error('Requesty sent a stream event that is not valid JSON');
  }
  if (json?.error) {
    throw new Error(`Requesty error: ${json.error.message ?? 'stream failed'}`);
  }
  if (!Array.isArray(json?.choices)) {
    throw new Error('Requesty sent a stream event without choices');
  }
  return json.choices[0]?.delta?.content ?? undefined;
}
