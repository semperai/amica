import { askLLM } from "@/utils/askLlm";
import { TimestampedPrompt } from "@/features/amicaLife/eventHandler";
import { randomBytes } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { twitterClientInstance as twitterClient } from "@/features/externalAPI/socialMedia/twitterClient";
import { telegramClientInstance as telegramCLient } from "@/features/externalAPI/socialMedia/telegramClient";
import { config } from "@/utils/config";
import isDev from "@/utils/isDev";
import { handleConfig, subconsciousUrl, userInputUrl } from "@/features/externalAPI/externalAPI";

interface ApiResponse {
  sessionId?: string;
  outputType?: string;
  response?: any;
  error?: string;
}

interface LogEntry {
  sessionId: string;
  timestamp: string;
  inputType: string;
  outputType: string;
  response?: any;
  error?: string;
}

const logs: LogEntry[] = [];
const clients: Array<{ res: NextApiResponse }> = [];

let logsUrl = new URL(`${process.env.NEXT_PUBLIC_DEVELOPMENT_BASE_URL}/api/dataHandler`);
logsUrl.searchParams.append("type", "logs");

// Helper Functions
const generateSessionId = (sessionId?: string): string =>
  sessionId || randomBytes(8).toString("hex");

const sendError = (
  res: NextApiResponse<ApiResponse>,
  sessionId: string,
  message: string,
  status = 400
) => res.status(status).json({ sessionId, error: message });

const sendToClients = (message: { type: string; data: any }) => {
  const formattedMessage = JSON.stringify(message);
  clients.forEach((client) => client.res.write(`data: ${formattedMessage}\n\n`));
};

// Processors
const processNormalChat = async (message: string): Promise<string> =>
  await askLLM(config("system_prompt"), message, null);

const requestMemory = async (): Promise<TimestampedPrompt[]> => {
  const response = await fetch(subconsciousUrl);
  return response.json();
};

const requestLogs = async (): Promise<[]> => {
  const response = await fetch(logsUrl);
  return response.json();
};

const requestUserInputMessages = async (): Promise<[]> => {
  const response = await fetch(userInputUrl);
  return response.json();
};

const updateSystemPrompt = async (payload: any): Promise<any> => {
  const { prompt } = payload;
  let response = sendToClients({ type: "systemPrompt", data: prompt });
  return response;
};

const triggerAmicaActions = async (payload: any): Promise<any> => {
  const { text, socialMedia, playback, reprocess, animation } = payload;
  let response;

  if (text) {
    const message = reprocess
      ? await askLLM(config("system_prompt"), text, null)
      : text;

    response = await handleSocialMediaActions(message, socialMedia);
  }

  if (playback) {
    response = sendToClients({ type: "playback", data: 10000 });
  }

  if (animation) {
    response = sendToClients({ type: "animation", data: animation });
  }

  return response;
};

const handleSocialMediaActions = async (
  message: string,
  socialMedia: string
): Promise<any> => {
  switch (socialMedia) {
    case "twitter":
      return await twitterClient.postTweet(message);
    case "tg":
      return await telegramCLient.postMessage(message);
    case "none":
      sendToClients({ type: "normal", data: message });
      return "Broadcasted to clients";
    default:
      console.log("No social media selected for posting.");
      return "No action taken for social media.";
  }
};

// API Handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Syncing config to be accessible from server side
  await handleConfig("fetch");

  if (req.method === "GET") {
    handleSSEConnection(req, res);
    return;
  }

  if (config("external_api_enabled") !== "true") {
    return sendError(res, "", "API is currently disabled.", 503);
  }

  const { sessionId, inputType, payload, noProcessChat = false } = req.body;
  const currentSessionId = generateSessionId(sessionId);
  const timestamp = new Date().toISOString();

  if (!inputType) {
    return sendError(res, currentSessionId, "inputType are required.");
  }

  try {
    const { response, outputType } = await processRequest(inputType, payload);
    logs.push({
      sessionId: currentSessionId,
      timestamp,
      inputType,
      outputType,
      response,
    });
    res.status(200).json({ sessionId: currentSessionId, outputType, response });
  } catch (error) {
    handleProcessingError(res, error, currentSessionId, inputType, timestamp);
  }
}

// Sub-functions
const handleSSEConnection = (
  req: NextApiRequest,
  res: NextApiResponse
): void => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Connection", "keep-alive");

  const client = { res };
  clients.push(client);

  req.on("close", () => {
    console.log("Client disconnected");
    clients.splice(clients.indexOf(client), 1);
    res.end();
  });
};

const processRequest = async (
  inputType: string,
  payload: any
): Promise<{ response: any; outputType: string }> => {
  
  switch (inputType) {
    case "Normal Chat Message":
      return { response: await processNormalChat(payload), outputType: "Complete stream" };
    case "Memory Request":
      return { response: await requestMemory(), outputType: "Memory Array" };
    case "RPC Logs":
      return { response: await requestLogs(), outputType: "Webhook" };
    case "RPC User Input Messages":
      return { response: await requestUserInputMessages(), outputType: "Webhook" };
    case "Update System Prompt":
      return { response: await updateSystemPrompt(payload), outputType: "Updated system prompt" };
    case "Twitter Message":
    case "Brain Message":
      return { response: payload, outputType: "Text" };
    case "Reasoning Server":
      return { response: await triggerAmicaActions(payload), outputType: "Action Triggered" };
    default:
      throw new Error("Unknown input type");
  }
};

const handleProcessingError = (
  res: NextApiResponse<ApiResponse>,
  error: any,
  sessionId: string,
  inputType: string,
  timestamp: string
): void => {
  console.error("Handler error:", error);
  logs.push({
    sessionId,
    timestamp,
    inputType,
    outputType: "Error",
    error: String(error),
  });
  sendError(res, sessionId, "An error occurred while processing the request.", 500);
};