import type { JSONSchemaType } from 'ajv';

export interface ToolOption {
  type: string | 'function',
  function: JSONSchemaType<{}>,
}

export interface BotOptions {
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
  multimodal?: boolean,
}

