import { CustomBackend, CustomBackendProps } from './custom-backend';
import type { Message } from './messages';

interface CustomBotBackendProps extends CustomBackendProps {
  url?: string,
}

const CUstomBotBackendSchema = {
  url: {
    type: 'string',
    description: 'the backend url',
  },
  temperature: {
    type: 'number',
    value: 0.7,
    description: 'a parameter that controls the “creativity” or randomness of the text generated. A higher temperature (e.g., 0.7) results in more diverse and creative output, while a lower temperature (e.g., 0.2) makes the output more deterministic and focused.',
  },
}

export declare interface CustomBotBackend extends CustomBotBackendProps {

}

export class CustomBotBackend extends CustomBackend {
  getResponseStream(messages: Message[]): Promise<ReadableStream> | void {}
}
CustomBotBackend.defineProperties(CustomBotBackend, CUstomBotBackendSchema)

CustomBackend.registerBackend(CustomBotBackend)

