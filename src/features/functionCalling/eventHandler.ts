import { handleNews } from "../plugins/news";

export async function expandPrompt(prompt: string, values: any) {
    for (const key in values) {
      prompt = prompt.replace(`{${key}}`, values[key]);
    }
    return prompt;
}
  
export async function handleFunctionCalling(event: string) {
  switch (event) {
    case "news":
      const newsSummary = await handleNews();
      return newsSummary;

    default:
      console.log(`Unknown event: ${event}`);
  }
}