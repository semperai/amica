import { BotOptions } from "../message-options";

export interface LlamaImage {
  id: string,
  data: string,
}

export interface LlamaSystemPrompt {
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
