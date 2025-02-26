import { randomBytes } from "crypto";
import type { NextApiResponse } from "next";
import fs from "fs";
import { sseClients } from "@/pages/api/amicaHandler";

export interface ApiResponse {
  sessionId?: string;
  outputType?: string;
  response?: any;
  error?: string;
}

export interface apiLogEntry {
  sessionId: string;
  timestamp: string;
  inputType: string;
  outputType: string;
  response?: any;
  error?: string;
}

export const generateSessionId = (sessionId?: string): string =>
  sessionId || randomBytes(8).toString("hex");

export const sendError = (
  res: NextApiResponse,
  sessionId: string,
  message: string,
  status = 400,
) => res.status(status).json({ sessionId, error: message });

export const sendToClients = (message: { type: string; data: any }) => {
  const formattedMessage = JSON.stringify(message);
  sseClients.forEach((client) => client.res.write(`data: ${formattedMessage}\n\n`));
};

export const readFile = (filePath: string): any => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error);
    throw new Error(`Failed to read file: ${error}`);
  }
};

export const writeFile = (filePath: string, content: any): void => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf8");
  } catch (error) {
    console.error(`Error writing file at ${filePath}:`, error);
    throw new Error(`Failed to write file: ${error}`);
  }
};
