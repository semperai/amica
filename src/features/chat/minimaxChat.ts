import { Message } from './messages';
import { config } from '@/utils/config';

/**
 * Gets a streaming chat response from MiniMax API.
 * MiniMax provides an OpenAI-compatible API for chat completions.
 * Supports models: MiniMax-M2.7, MiniMax-M2.5, MiniMax-M2.5-highspeed
 */
export async function getMiniMaxChatResponseStream(messages: Message[]): Promise<ReadableStream> {
  const apiKey = config('minimax_apikey');
  if (!apiKey) {
    throw new Error('MiniMax API key is required');
  }

  const baseUrl = config('minimax_url') ?? 'https://api.minimax.io/v1';
  const model = config('minimax_model') ?? 'MiniMax-M2.7';

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: messages.map(({ role, content }) => ({ role, content })),
      stream: true,
      max_tokens: 200,
    })
  });

  const reader = response.body?.getReader();
  if (!response.ok || !reader) {
    if (response.status === 401) {
      throw new Error('Invalid MiniMax API key');
    }
    if (response.status === 402) {
      throw new Error('MiniMax payment required');
    }

    const error = await response.json().catch(() => ({}));
    const errorMsg = error?.base_resp?.status_msg || error?.error?.message || `status ${response.status}`;
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
    }
  });
  return stream;
}
