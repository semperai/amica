import { twitterClientInstance as twitterClient } from "../socialMedia/twitterClient";
import { telegramClientInstance as telegramClient } from "../socialMedia/telegramClient";
import { sendToClients } from "./apiHelper";

export const handleSocialMediaActions = async (
  message: string,
  socialMedia: string
): Promise<any> => {
  switch (socialMedia) {
    case "twitter":
      return await twitterClient.postTweet(message);
    case "tg":
      return await telegramClient.postMessage(message);
    case "none":
      sendToClients({ type: "normal", data: message });
      return "Broadcasted to clients";
    default:
      throw new Error("No action taken for social media.");
  }
};
