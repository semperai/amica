import { Chat } from "@/features/chat/chat";
import { askLLM } from "@/utils/askLlm";

async function fetcher(url: string, event: string): Promise<Response> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${event}: ${response.statusText}`);
        }
        return response;
    } catch (error) {
        console.error("Error in function calling fetcher:", error);
        throw error; 
    }
}

export async function handleNews(prompt: string): Promise<string> {
  try {
    // Fetch the RSS feed from Google News
    const response = await fetcher("https://news.google.com/rss/", "news");
    const text = await response.text();

    if (!text) {
      throw new Error("No text content found in the XML document");
    }

    // Process the extracted text content with the given prompt
    const result = await askLLM(prompt, text);
    console.log("News function calling result : ", result);

    return result;
  } catch (error) {
    console.error("Error in handleNews:", error);
    return "An error occurred while fetching and processing the news.";
  }
}
