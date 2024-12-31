import { openaiWhisper } from '@/features/openaiWhisper/openaiWhisper';
import { whispercpp } from '@/features/whispercpp/whispercpp';
import { askVisionLLM } from '@/utils/askLlm';
import { TimestampedPrompt } from '@/features/amicaLife/eventHandler';
import { config as configs} from '@/utils/config';
// import { logs } from './amicaHandler';

import { randomBytes } from 'crypto';
import sharp from 'sharp';
import formidable from 'formidable';
import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';

interface ApiResponse {
  sessionId?: string;
  outputType?: string;
  response?: string | TimestampedPrompt[];
  error?: string;
}

// Configure body parsing: disable only for multipart/form-data
export const config = {
    api: {
      bodyParser: false
    },
};
  

const generateSessionId = (sessionId?: string) => sessionId || randomBytes(8).toString('hex');

// Helper for setting error responses
const sendError = (res: NextApiResponse<ApiResponse>, sessionId: string, message: string, status = 400) =>
  res.status(status).json({ sessionId, error: message });

// Main API handler
export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (process.env.API_ENABLED !== 'true') {
    return sendError(res, "", "API is currently disabled.", 503);
  }

  const currentSessionId = generateSessionId(req.body?.sessionId);
  const timestamp = new Date().toISOString();

  if (req.headers['content-type']?.includes('multipart/form-data')) {
    // Handle form-data
    const form = formidable({});
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        return sendError(res, currentSessionId, "Failed to parse form data.");
      }
      handleRequest(currentSessionId, timestamp, fields, files, res);
    });
  } else {
    return sendError(res, currentSessionId, "Incorrect type");
  }
}

async function handleRequest(sessionId: string, timestamp: string, fields: any, files: any, res: NextApiResponse<ApiResponse>) {
  let response: string | undefined | TimestampedPrompt[];
  let outputType: string | undefined;

  const inputType =  fields.inputType[0];
  const payload = files?.payload[0] ;

  try {
    switch (inputType) {
      case "Voice":
        if (files?.payload[0]) {
          const filePath = payload.filepath;
          const fileBuffer = fs.readFileSync(filePath);
          const audioFile = new File([fileBuffer], "input.wav", { type: "audio/wav" });
          response = await transcribeVoice(audioFile);
          outputType = "Text";
        } else {
          throw new Error("Voice input file missing.");
        }
        break;

      case "Image":
        if (files?.payload[0]) {
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

    // logs.push({ sessionId: sessionId, timestamp, inputType, outputType, response });
    res.status(200).json({ sessionId, outputType, response });
  } catch (error) {
    console.error("Handler error:", error);
    // logs.push({ sessionId: sessionId, timestamp, inputType, outputType: "Error", error: String(error) });
    return sendError(res, sessionId, "An error occurred while processing the request.", 500);
  }
}

// Transcribe voice input to text
async function transcribeVoice(audio: File): Promise<string> {
  try {
    switch (configs("stt_backend")) {
      case 'whisper_openai': {
        const result = await openaiWhisper(audio);
        return result?.text; // Assuming the transcription is in result.text
      }
      case 'whispercpp': {
        const result = await whispercpp(audio);
        return result?.text; // Assuming the transcription is in result.text
      }
      default:
        throw new Error("Invalid STT backend configuration.");
    }
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error("Failed to transcribe audio.");
  }
}

// Process image using Vision LLM
async function processImage(payload: Buffer): Promise<string> {
  const jpegImg = await convertToJpeg(payload);
  if (!jpegImg) {
    throw new Error("Failed to process image");
  }
  return await askVisionLLM(jpegImg);
}

// Convert image to JPEG and return as base64
async function convertToJpeg(payload: Buffer): Promise<string | null> {
  try {
    const jpegBuffer = await sharp(payload).jpeg().toBuffer();
    return jpegBuffer.toString('base64');
  } catch (error) {
    console.error("Error converting image to .jpeg:", error);
    return null;
  }
}



