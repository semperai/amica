import { randomBytes } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

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
