import { Message } from './chat';
import { config } from '@/utils/config';

/**
 * Gets a streaming chat response from OpenRouter API.
 * OpenRouter provides an OpenAI-compatible API with access to multiple models.
 */
export async function getOpenRouterChatResponseStream(messages: Message[]): Promise<ReadableStream> {
  const apiKey = config('openrouter_apikey');
  if (!apiKey) {
    throw new Error('OpenRouter API key is required');
  }

  const baseUrl = config('openrouter_url') ?? 'https://openrouter.ai/api/v1';
  const model = config('openrouter_model') ?? 'openai/gpt-3.5-turbo';
  const appUrl = config('app_url') ?? 'https://amica.chat';

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
    const error = await response.json();
    // Handle OpenRouter-specific error format
    if (error.error?.message) {
      throw new Error(`OpenRouter error: ${error.error.message}`);
    }
    throw new Error(`OpenRouter request failed with status ${response.status}`);
  }

  return response.body!;
}
