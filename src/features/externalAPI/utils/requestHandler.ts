import { subconsciousUrl, userInputUrl, logsUrl, chatLogsUrl } from "@/features/externalAPI/externalAPI";

export const requestMemory = async () => {
  const response = await fetch(subconsciousUrl);
  return response.json();
};

export const requestLogs = async () => {
  const response = await fetch(logsUrl);
  return response.json();
};

export const requestUserInputMessages = async () => {
  const response = await fetch(userInputUrl);
  return response.json();
};

export const requestChatHistory = async () => {
  const response = await fetch(chatLogsUrl);
  return response.json();
};