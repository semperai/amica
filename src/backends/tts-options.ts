import { BackendProps } from './backend-options';

export interface TTSProps extends BackendProps {
  muted?: boolean,
}

export const TTSPropsSchema = {
  muted: {
    type: 'boolean',
    description: 'Whether muted.',
  },
  voice: {
    type: 'string',
    description: 'which voice id to speak',
  }
}
