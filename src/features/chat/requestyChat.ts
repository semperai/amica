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
      try {
        // sometimes the response is chunked, so we need to combine the chunks
        let combined = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
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
    }
  });
  return stream;
}
