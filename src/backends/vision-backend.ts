import { Backend } from './backend';
import { BotBackend, MessageParams } from './bot-backend';

export interface VisionMessageParams extends MessageParams {
  imageData: string|string[]
}

export class VisionBackend extends BotBackend {
  async getResponse(options: VisionMessageParams): Promise<string> { return '' }
}

Backend.register(VisionBackend)

