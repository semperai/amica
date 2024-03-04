import cloneDeep from 'lodash/cloneDeep'

import { Backend } from './backend';
import { BotBackend, MessageParams } from './bot-backend';
import { BotPropsSchema } from './bot-options';

export interface VisionMessageParams extends MessageParams {
  imageData: string|string[]
}

export class VisionBackend extends BotBackend {
  async getResponse(options: VisionMessageParams): Promise<string> { return '' }
}

const VisionPropsSchema = cloneDeep(BotPropsSchema)
VisionPropsSchema.temperature.value = 0

VisionBackend.defineProperties(VisionBackend, VisionPropsSchema)

Backend.register(VisionBackend)

