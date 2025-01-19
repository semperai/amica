import { askLLM } from "@/utils/askLlm";
import { config } from "@/utils/config";
import { handleSocialMediaActions } from "@/features/externalAPI/utils/socialMediaHandler";

export const processNormalChat = async (message: string): Promise<string> => {
  return await askLLM(config("system_prompt"), message, null);
};

export const triggerAmicaActions = async (payload: any, sendToClients: Function) => {
  const { text, socialMedia, playback, reprocess, animation } = payload;

  if (text) {
    const message = reprocess
      ? await askLLM(config("system_prompt"), text, null)
      : text;
    await handleSocialMediaActions(message, socialMedia);
  }

  if (playback) {
    sendToClients({ type: "playback", data: 10000 });
  }

  if (animation) {
    sendToClients({ type: "animation", data: animation });
  }
};

export const updateSystemPrompt = async (payload: any, sendToClients: Function): Promise<any> => {
    const { prompt } = payload;
    let response = sendToClients({ type: "systemPrompt", data: prompt });
    return response;
  };
  
