import { CustomBackend, CustomBackendProps } from '../custom-backend';
import type { Message } from './messages';

interface CustomBotBackendProps extends CustomBackendProps {
  url?: string,
}

const CUstomBotBackendSchema = {
  url: {
    type: 'string',
    description: 'the backend url',
  },
}

export declare interface CustomBotBackend extends CustomBotBackendProps {

}

export class CustomBotBackend extends CustomBackend {
  getResponseStream(messages: Message[]): Promise<ReadableStream> | void {}
}
CustomBotBackend.defineProperties(CustomBotBackend, CUstomBotBackendSchema)

CustomBackend.registerBackend(CustomBotBackend)

