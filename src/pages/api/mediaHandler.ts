import { NextApiRequest, NextApiResponse } from "next";

import { TimestampedPrompt } from "@/features/amicaLife/eventHandler";
import { config as configs } from "@/utils/config";
import { apiLogs } from "./amicaHandler";

import { ApiResponse, sendError } from "@/features/externalAPI/utils/apiHelper";
import { transcribeVoice } from "@/features/externalAPI/processors/voiceProcessor";
import { processImage } from "@/features/externalAPI/processors/imageProcessor";

import formidable from "formidable";
import fs from "fs";
import { WaveFile } from "wavefile";
import { readStore, writeServerConfig } from "@/features/externalAPI/memoryStore";
import { runWithServerContext } from "@/features/externalAPI/serverContext";

// Configure body parsing: disable only for multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Main API handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  if (req.headers["content-type"]?.includes("multipart/form-data")) {
    // Handle form-data
    const form = formidable({});
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        return sendError(res, "", "Failed to parse form data.");
      }

      const sessionId = fields?.sessionId?.[0];
      if (!sessionId || typeof sessionId !== "string") {
        return sendError(
          res,
          "",
          "sessionId is required and must be a string",
          400,
        );
      }

      // Syncing config to be accessible from server side
      const configFromToken = await readStore(sessionId, "configs")
      const timestamp = new Date().toISOString();

      // Apply the config globally for the request
      return runWithServerContext({ sessionId }, async () => {
        writeServerConfig(sessionId, configFromToken!);
        if (configs("external_api_enabled") !== "true") {
          return sendError(res, "", "API is currently disabled.", 503);
        }

        try {
          await handleRequest(sessionId, timestamp, fields, files, res);
        } catch (error) {
          console.error("Error in form processing:", error);
          sendError(res, sessionId, String(error), 500);
        }
      });
    });
  } else {
    return sendError(res, "", "Incorrect type");
  }
}

async function handleRequest(
  sessionId: string,
  timestamp: string,
  fields: any,
  files: any,
  res: NextApiResponse<ApiResponse>,
) {
  let response: string | undefined | TimestampedPrompt[];
  let outputType: string | undefined;

  const inputType = fields?.inputType?.[0] || null;
  const payload = files?.payload?.[0] || null;

  if (!inputType) {
    throw new Error("Missing or invalid inputType field.");
  }

  if (!payload) {
    throw new Error("Payload file is missing.");
  }

  try {
    switch (inputType) {
      case "Voice":
        if (payload) {
          const filePath = payload.filepath;
          const fileBuffer = fs.readFileSync(filePath);
          const wav = new WaveFile();
          wav.fromScratch(1, 16000, "32f", fileBuffer);
          wav.toBitDepth("16");
          const audioFile = new File(
            [new Uint8Array(wav.toBuffer())],
            "input.wav",
            { type: "audio/wav" },
          );
          response = await transcribeVoice(audioFile);
          outputType = "Text";
        } else {
          throw new Error("Voice input file missing.");
        }
        break;

      case "Image":
        if (payload) {
          const imageBuffer = fs.readFileSync(payload.filepath);
          response = await processImage(imageBuffer);
          outputType = "Text";
        } else {
          throw new Error("Image input file missing.");
        }
        break;

      default:
        return sendError(res, sessionId, "Unknown input type.");
    }

    apiLogs.push({
      sessionId: sessionId,
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
}
