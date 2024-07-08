import { Chat } from "@/features/chat/chat";
import { handleNews } from "@/features/functionCalling/eventHandler";

const prompts = {
  news: `You are a newscaster specializing in providing news. Use the following context from The New York Times News to commented on. [{context_str}]`,
};

export async function functionCalling(event: string) {
  switch (event) {
    case "news":
      const newsSummary = await handleNews(prompts[event]);
      return newsSummary;

    default:
      console.log(`Unknown event: ${event}`);
  }
}
