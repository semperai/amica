import { Backend } from './backend';
import { BotPropsSchema } from './message-options';
import type { Message } from './messages';

export interface MessageParams {
  messages: Message[],
  [k: string]: any,
}

export class BotBackend extends Backend {
  async getResponseStream(options: MessageParams): Promise<ReadableStream> {
    return new ReadableStream
  }
  async getResponse(options: MessageParams): Promise<string> {
    return ''
  }
}

BotBackend.defineProperties(BotBackend, BotPropsSchema)

Backend.register(BotBackend)

