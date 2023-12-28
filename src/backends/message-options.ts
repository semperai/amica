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

interface LlamaImage {
  id: string,
  data: string,
}

interface LlamaSystemPrompt {
  prompt: string,
  anti_prompt?: string,
  assistant_name?: string,
}

export interface LlamaOptions extends BotOptions {
  cache_prompt?: boolean,
  grammar?: string,
  ignore_eos?: boolean,
  image_data?: LlamaImage[],
  input_prefix?: string,
  input_suffix?: string,
  min_p?: number,
  mirostat?: number,
  mirostat_tau?: number,
  mirostat_eta?: number,
  n_keep?: number,
  n_predict?: number,
  n_probs?: number,
  penalize_nl?: number,
  penalty_prompt?: string|number[],
  presence_penalty?: number,
  repeat_last_n?: number,
  repeat_penalty?: number,
  system_prompt?: LlamaSystemPrompt,
  tfs_z?: number,
  top_k?: number,
  typical_p?: number,
}
