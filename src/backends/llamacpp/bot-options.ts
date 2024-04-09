import { BotProps } from "../bot-options";

export interface LlamaImage {
  id: string,
  data: string,
}

export interface LlamaSystemPrompt {
  prompt: string,
  anti_prompt?: string,
  assistant_name?: string,
}

export interface LlamaProps extends BotProps {
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

export const LlamaPropsSchema = {
  cache_prompt: {
  type: 'boolean',
  value: true,
  skipDefault: false,
  description: '',
},
  grammar: {
  type: 'string',
  description: '',
},
  ignore_eos: {
  type: 'boolean',
  description: '',
},
  image_data: {
  type: 'LlamaImage[]',
  description: '',
},
  input_prefix: {
  type: 'string',
  description: '',
},
  input_suffix: {
  type: 'string',
  description: '',
},
  min_p: {
  type: 'number',
  description: '',
},
  mirostat: {
  type: 'number',
  description: '',
},
  mirostat_tau: {
  type: 'number',
  description: '',
},
  mirostat_eta: {
  type: 'number',
  description: '',
},
  n_keep: {
  type: 'number',
  description: '',
},
  n_predict: {
  type: 'number',
  value: 400,
  skipDefault: false,
  description: '',
},
  n_probs: {
  type: 'number',
  description: '',
},
  penalize_nl: {
  type: 'number',
  description: '',
},
  penalty_prompt: {
  type: ['string', 'number[]'],
  description: '',
},
  presence_penalty: {
  type: 'number',
  description: '',
},
  repeat_last_n: {
  type: 'number',
  description: '',
},
  repeat_penalty: {
  type: 'number',
  description: '',
},
  system_prompt: {
  type: 'LlamaSystemPrompt',
  description: '',
},
  tfs_z: {
  type: 'number',
  description: '',
},
  top_k: {
  type: 'number',
  description: '',
},
  typical_p: {
  type: 'number',
  description: '',
},
}
