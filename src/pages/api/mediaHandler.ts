import { openaiWhisper } from '@/features/openaiWhisper/openaiWhisper';
import { whispercpp } from '@/features/whispercpp/whispercpp';
import { askVisionLLM } from '@/utils/askLlm';
import { TimestampedPrompt } from '@/features/amicaLife/eventHandler';
import { config as configs } from '@/utils/config';
import { randomBytes } from 'crypto';
import sharp from 'sharp';
import { NextApiResponse } from 'next';
import { handleConfig } from '@/features/externalAPI/externalAPI';
import { NextRequest } from 'next/server';

interface ApiResponse {
  sessionId?: string;
  outputType?: string;
  response?: string | TimestampedPrompt[];
  error?: string;
}

// Configure body parsing: disable only for multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

const generateSessionId = (sessionId?: string) => sessionId || randomBytes(8).toString('hex');

// Helper for setting error responses
const sendError = (res: NextApiResponse<ApiResponse>, sessionId: string, message: string, status = 400) =>
  res.status(status).json({ sessionId, error: message });

// Main API handler
export default async function handler(req: NextRequest, res: NextApiResponse<ApiResponse>) {
  if (configs('external_api_enabled') !== 'true') {
    return sendError(res, '', 'API is currently disabled.', 503);
  }

  const currentSessionId = generateSessionId();
  const timestamp = new Date().toISOString();

  const contentType = req.headers.get('content-type');
  
  if (contentType?.includes('multipart/form-data')) {
    // Handle form-data using NextRequest.formData() method
    const formData = await req.formData();
    
    const fields: any = {};
    const files: any = {};

    formData.forEach((value, key) => {
      if (value instanceof File) {
        files[key] = value;
      } else {
        fields[key] = value;
      }
    });

    handleRequest(currentSessionId, timestamp, fields, files, res);
  } else {
    return sendError(res, currentSessionId, 'Incorrect type');
  }
}

async function handleRequest(
  sessionId: string,
  timestamp: string,
  fields: any,
  files: any,
  res: NextApiResponse<ApiResponse>
) {
  let response: string | undefined | TimestampedPrompt[];
  let outputType: string | undefined;

  const inputType = fields.inputType[0];
  const payload = files?.payload;

  // Syncing config to be accessible from server side
  await handleConfig('fetch');

  try {
    switch (inputType) {
      case 'Voice':
        if (payload) {
          const audioFile = new File([payload], 'input.wav', { type: 'audio/wav' });
          response = await transcribeVoice(audioFile);
          outputType = 'Text';
        } else {
          throw new Error('Voice input file missing.');
        }
        break;

      case 'Image':
        if (payload) {
          const imageBuffer = Buffer.from(await payload.arrayBuffer());
          response = await processImage(imageBuffer);
          outputType = 'Text';
        } else {
          throw new Error('Image input file missing.');
        }
        break;

      default:
        return sendError(res, sessionId, 'Unknown input type.');
    }

    res.status(200).json({ sessionId, outputType, response });
  } catch (error) {
    console.error('Handler error:', error);
    return sendError(res, sessionId, 'An error occurred while processing the request.', 500);
  }
}

// Transcribe voice input to text
async function transcribeVoice(audio: File): Promise<string> {
  try {
    switch (configs('stt_backend')) {
      case 'whisper_openai': {
        const result = await openaiWhisper(audio);
        return result?.text; // Assuming the transcription is in result.text
      }
      case 'whispercpp': {
        const result = await whispercpp(audio);
        return result?.text; // Assuming the transcription is in result.text
      }
      default:
        throw new Error('Invalid STT backend configuration.');
    }
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio.');
  }
}

// Process image using Vision LLM
async function processImage(payload: Buffer): Promise<string> {
  const jpegImg = await convertToJpeg(payload);
  if (!jpegImg) {
    throw new Error('Failed to process image');
  }
  return await askVisionLLM(jpegImg);
}

// Convert image to JPEG and return as base64
async function convertToJpeg(payload: Buffer): Promise<string | null> {
  try {
    const jpegBuffer = await sharp(payload).jpeg().toBuffer();
    return jpegBuffer.toString('base64');
  } catch (error) {
    console.error('Error converting image to .jpeg:', error);
    return null;
  }
}
