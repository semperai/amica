import { askLLM } from "@/utils/askLlm";
import { config } from "@/utils/config";
import { handleSocialMediaActions } from "@/features/externalAPI/utils/socialMediaHandler";
import { sendToClients } from "@/features/externalAPI/utils/apiHelper";
import { selectAnimationStateFromPayload } from "@/features/vrmViewer/animationState";


export const processNormalChat = async (message: string): Promise<string> => {
  return await askLLM(config("system_prompt"), message, null);
};

export const triggerAmicaActions = async (payload: any) => {
  const {
    text,
    socialMedia,
    playback,
    reprocess,
    animation,
    animation_state,
  } = payload;

  if (text) {
    const message = reprocess
      ? await askLLM(config("system_prompt"), text, null)
      : text;
    await handleSocialMediaActions(message, socialMedia);
  }

  const selectedAnimationState = selectAnimationStateFromPayload({
    animation_state,
  });

  if (selectedAnimationState) {
    sendToClients({ type: "animation_state", data: selectedAnimationState });
  }

  if (playback) {
    sendToClients({ type: "playback", data: 10000 });
  }

  if (animation && !selectedAnimationState) {
    sendToClients({ type: "animation", data: animation });
  }
};

export const updateSystemPrompt = async (payload: any): Promise<any> => {
    const { prompt } = payload;
    let response = sendToClients({ type: "systemPrompt", data: prompt });
    return response;
  };
  
