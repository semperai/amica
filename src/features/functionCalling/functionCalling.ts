import { Chat } from "@/features/chat/chat";
import { handleNews } from "@/features/functionCalling/eventHandler";

const prompts = {
  news: `You are a newscaster specializing in providing news. Use the following context from Google News to summarize random headlines and its description for today. Do not display the pub date or timestamp. 
    \n\nFormat:\n
    #. [News Item] - [News Source] : [Its Description]]
    \n\nExamples:\n
    1. The World is Round - Science : The scientific community reaffirms the earth's spherical shape.\n
    2. The Election is over and Children have won - US News : Children win the student council elections.\n
    3. Storms Hit the Southern Coast - ABC : Severe weather causes flooding and damage in coastal areas.`,
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
