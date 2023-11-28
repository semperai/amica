import { Message } from "@/features/chat/messages";
import { config } from '@/utils/config';

export function buildPrompt(messages: Message[]) {
  let prompt = "";
  for (let m of messages) {
    switch(m.role) {
      case 'system':
        prompt += config("system_prompt")+"\n\n";
        break;
      case 'user':
        prompt += `User: ${m.content}\n`;
        break;
      case 'assistant':
        prompt += `${config("name")}: ${m.content}\n`;
        break;
    }
  }
  prompt += `${config('name')}:`;
  return prompt;
}

export function buildVisionPrompt(messages: Message[]) {
  let prompt = "";
  for (let m of messages) {
    switch(m.role) {
      case 'system':
        prompt += config("vision_system_prompt")+"\n\n";
        break;
      case 'user':
        prompt += `User: ${m.content}\n`;
        break;
      case 'assistant':
        prompt += `${config("name")}: ${m.content}\n`;
        break;
    }
  }
  prompt += `${config('name')}:`;
  return prompt;
}
