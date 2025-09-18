import { askLLM } from "@/utils/askLlm";
import { config } from "@/utils/config";
import { handleSocialMediaActions } from "@/features/externalAPI/utils/socialMediaHandler";
import { NextApiRequest } from "next";
import { addClientEvents } from "../externalAPI";
import { v4 as uuidv4 } from "uuid";
import { getEaiSupabase } from "@/utils/supabase";

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

    let recordingData: any = false;
    if (playback) {
      const uuid = uuidv4().split("-")[0];
      const fileName = `${sessionId}-${uuid}`
      const eaiSupabase = getEaiSupabase();
      addClientEvents(sessionId,"playback", {time:"10000", "uuid": uuid});
      if (animation) {
        addClientEvents(sessionId, "animation", animation);
      }
      const maxAttempts = 20;
      const delayMs = 1000; // 1 second
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const { data, error } = await eaiSupabase!
          .from("recordings")
          .select("file_path")
          .eq("session_id", sessionId)
          .eq("id", fileName)
          .limit(1)
          .order("created_at", { ascending: false });

        if (error) throw new Error(`Supabase query failed: ${error.message}`);

        if (data && data.length > 0) {
          recordingData = data[0].file_path;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      if (!recordingData) {
        throw new Error("Timeout waiting for recording to be uploaded");
      }
    } else {
      if (animation) {
        addClientEvents(sessionId, "animation", animation);
      }
    }

    return {
      success: true,
      message: "Actions triggered successfully",
      data: {
        socialMedia: socialRes,
        playback: recordingData,
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
