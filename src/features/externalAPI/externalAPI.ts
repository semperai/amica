import { config, defaults, prefixed } from "@/utils/config";
import isDev from "@/utils/isDev";
import { keyboard } from "telegraf/typings/markup";

export const configUrl = new URL(`http://localhost:3000/api/dataHandler`);
configUrl.searchParams.append("type", "config");

export const userInputUrl = new URL(`http://localhost:3000/api/dataHandler`);
userInputUrl.searchParams.append("type", "userInputMessages");

export const subconsciousUrl = new URL(`http://localhost:3000/api/dataHandler`);
subconsciousUrl.searchParams.append('type', 'subconscious');

// Cached server config
export let serverConfig: Record<string, string> = {};

export async function fetcher(method: string, url: URL, data?: any) {
  let response: any;
  switch (method) {
    case "POST":
      try {
        response = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error("Failed to POST server config: ", error);
      }
      break;

    case "GET":
      try {
        response = await fetch(url);
        if (response.ok) {
          serverConfig = await response.json();
        }
      } catch (error) {
        console.error("Failed to fetch server config:", error);
      }
      break;

    default:
      break;
  }
}

export async function handleConfig(
  type: string,
  data?: Record<string, string>,
) {
  if (!isDev) {
    return;
  }

  switch (type) {
    // Call this function at the beginning of your application to load the server config and sync to localStorage if needed.
    case "init":
      let localStorageData: Record<string, string> = {};

      for (const key in defaults) {
        const localKey = prefixed(key);
        const value = localStorage.getItem(localKey);

        if (value !== null) {
          localStorageData[key] = value;
        } else {
          // Append missing keys with default values
          localStorageData[key] = (<any>defaults)[key];
        }
      }

      // Sync update to server config
      await fetcher("POST", configUrl, localStorageData);

      break;
    case "fetch":
      // Sync update to server config cache
      await fetcher("GET", configUrl);

      break;

    case "update":
      await fetcher("POST", configUrl, data);

      break;

    default:
      break;
  }
}

export async function handleUserInput(message: string) {
  if (!isDev) {
    return;
  }

  fetch(userInputUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemPrompt: config("system_prompt"),
      message: message,
    }),
  });
}
