import type { NextApiRequest, NextApiResponse } from "next";

import { config } from "@/utils/config";

import {
  sendError,
  apiLogEntry,
  ApiResponse,
} from "@/features/externalAPI/utils/apiHelper";
import {
  processNormalChat,
  triggerAmicaActions,
  updateSystemPrompt,
} from "@/features/externalAPI/processors/chatProcessor";
import {
  readStore,
  updateStore,
  writeServerConfig,
} from "@/features/externalAPI/memoryStore";
import { runWithServerContext } from "@/features/externalAPI/serverContext";

export const apiLogs: apiLogEntry[] = [];

// Main Amica Handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  const { sessionId, inputType, payload, noProcessChat = false } = req.body;
  return runWithServerContext({ sessionId }, async () => {
    const timestamp = new Date().toISOString();
    if (!sessionId || typeof sessionId !== "string") {
      return sendError(
        res,
        "",
        "sessionId is required and must be a string",
        400,
      );
    }

    // Apply the config globally for the request
    const configs = await readStore(sessionId, "configs");
    writeServerConfig(sessionId, configs);

    if (config("external_api_enabled") !== "true") {
      return sendError(res, sessionId, "API is currently disabled.", 503);
    }

    if (!inputType) {
      return sendError(res, sessionId, "inputType are required.");
    }

    try {
      const { response, outputType } = await processRequest(
        req,
        sessionId,
        inputType,
        payload,
      );
      apiLogs.push({
        sessionId,
        timestamp,
        inputType,
        outputType,
        response,
      });
      res.status(200).json({ sessionId, outputType, response });
    } catch (error) {
      apiLogs.push({
        sessionId: sessionId,
        timestamp,
        inputType,
        outputType: "Error",
        error: String(error),
      });
      sendError(res, sessionId, String(error), 500);
    }
  });
}

const processRequest = async (
  req: NextApiRequest,
  sessionId: string,
  inputType: string,
  payload: any,
) => {
  switch (inputType) {
    case "Normal Chat Message":
      return { response: await processNormalChat(payload), outputType: "Chat" };
    case "Memory Request":
      return {
        response: await readStore(sessionId, "subconscious"),
        outputType: "Memory",
      };
    case "RPC Logs":
      return { response: await readStore(sessionId, "logs"), outputType: "Logs" };
    case "RPC User Input Messages":
      return {
        response: await readStore(sessionId, "user_input_messages"),
        outputType: "User Input",
      };
    case "Update System Prompt":
      return {
        response: await updateSystemPrompt(sessionId, payload),
        outputType: "Updated system prompt",
      };
    case "Brain Message":
      return {
        response: await updateStore(sessionId, "subconscious", payload),
        outputType: "Added subconscious stored prompt",
      };
    case "Chat History":
      return {
        response: await readStore(sessionId, "chat_logs"),
        outputType: "Chat History",
      };
    case "Reasoning Server":
      return {
        response: await triggerAmicaActions(sessionId, req, payload),
        outputType: "Actions",
      };
    default:
      throw new Error("Invalid input type");
  }
};

