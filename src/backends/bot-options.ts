import type { JSONSchemaType } from 'ajv';
import { BackendProps } from './backend-options';

export interface ToolOption {
  type: string | 'function',
  function: JSONSchemaType<{}>,
}

export interface BotProps extends BackendProps {
  bot_name?: string,
  multimodal?: boolean,
  frequency_penalty?: number,
  logit_bias?: any[],
  logprobs?: boolean,
  top_logprobs?: number,
  max_tokens?: number,
  n?: number,
  presence_penalty?: number,
  seed?: number,
  stop?: string[]|string,
  stream?: boolean,
  temperature?: number,
  top_p?: number,
  tools?: ToolOption[],
  tool_choice?: string|ToolOption,
  user?: string,
}

export const BotPropsSchema = {
  bot_name: {
    type: 'string',
    description: 'the bot assistant name',
  },
  multimodal: {
    type: 'boolean',
    description: 'Whether supports multimodal.',
  },
  frequency_penalty: {
    type: 'number',
    description: 'Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model\'s likelihood to repeat the same line verbatim.',
  },
  logit_bias: {
    type: 'array',
    description: 'Modify the likelihood of specified tokens appearing in the completion.',
  },
  logprobs: {
    type: 'boolean',
    description: 'Whether to return log probabilities of the output tokens or not. If true, returns the log probabilities of each output token returned in the content of message.',
  },
  top_logprobs: {
    type: 'boolean',
    description: 'An integer between 0 and 5 specifying the number of most likely tokens to return at each token position, each with an associated log probability. logprobs must be set to true if this parameter is used.',
  },
  max_tokens: {
    type: 'number',
    description: 'The maximum number of tokens that can be generated in the chat completion.',
  },
  n: {
    type: 'number',
    description: 'How many chat completion choices to generate for each input message. Note that you will be charged based on the number of generated tokens across all of the choices. Keep n as 1 to minimize costs.',
  },
  presence_penalty: {
    type: 'number',
    description: 'encourage the model to include a diverse range of tokens in the generated text. It is a value that is subtracted from the log-probability of a token each time it is generated. A higher presence_penalty value will result in the model being more likely to generate tokens that have not yet been included in the generated text.',
  },
  seed: {
    type: 'number',
    description: 'If specified, our system will make a best effort to sample deterministically, such that repeated requests with the same seed and parameters should return the same result. Determinism is not guaranteed, and you should refer to the system_fingerprint response parameter to monitor changes in the backend.',
  },
  stop: {
    type: ['string', 'string[]'],
    description: 'Up to 4 sequences where the API will stop generating further tokens.',
  },
  stream: {
    type: 'boolean',
    description: 'If set, partial message deltas will be sent, like in ChatGPT. Tokens will be sent as data-only server-sent events as they become available, with the stream terminated by a data: [DONE] message. ',
  },
  temperature: {
    type: 'number',
    value: 0.7,
    // export the default value always
    skipDefault: false,
    description: 'a parameter that controls the “creativity” or randomness of the text generated. A higher temperature (e.g., 0.7) results in more diverse and creative output, while a lower temperature (e.g., 0.2) makes the output more deterministic and focused.',
  },
  top_p: {
    type: 'number',
    description: 'An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered.',
  },
  tools: {
    type: 'ToolOption[]',
    description: 'A list of tools the model may call. Currently, only functions are supported as a tool. Use this to provide a list of functions the model may generate JSON inputs for.',
  },
  tool_choice: {
    type: ['string', 'ToolOption'],
    description: 'Controls which (if any) function is called by the model. none means the model will not call a function and instead generates a message. ',
  },
  user: {
    type: 'string',
    description: 'A unique identifier representing your end-user.',
  },
}
