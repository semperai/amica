import { askLLM } from "@/utils/askLlm";
import { config } from "@/utils/config";
import { handleSocialMediaActions } from "@/features/externalAPI/utils/socialMediaHandler";
import { NextApiRequest } from "next";
import { addClientEvents } from "../externalAPI";

export const processNormalChat = async (message: string): Promise<string> => {
  return await askLLM(config("system_prompt"), message, null);
};

export const triggerAmicaActions = async (
  sessionId: string,
  req: NextApiRequest,
  payload: any,
) => {
  const { text, socialMedia, playback, reprocess, animation } = payload;
  let socialRes = "";
  try {
    if (text) {
      const message = reprocess
        ? await askLLM(config("system_prompt"), text, null)
        : text;
      socialRes = await handleSocialMediaActions(
        sessionId,
        req,
        message,
        socialMedia,
      );
    }

    if (playback) {
      addClientEvents(sessionId,"playback", "10000");
    }

    if (animation) {
      addClientEvents(sessionId, "animation", animation);
    }
    return {
      success: true,
      message: "Actions triggered successfully",
      data: {
        socialMedia: socialRes,
        playback: !!playback,
        animation: animation || null,
      },
    };
  } catch (error: any) {
    console.error("Error in triggerAmicaActions:", error);
    return {
      success: false,
      message: "Failed to trigger Amica actions",
      error: error?.message || String(error),
    };
  }
};

export const updateSystemPrompt = async (
  sessionId: string,
  payload: any,
): Promise<any> => {
  const { prompt } = payload;
  let response = addClientEvents(sessionId,"systemPrompt", prompt);
  return response;
};
