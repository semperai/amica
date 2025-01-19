import { NextApiResponse } from 'next';
import { NextRequest } from 'next/server';

import { TimestampedPrompt } from '@/features/amicaLife/eventHandler';
import { config as configs } from '@/utils/config';
import { apiLogs } from './amicaHandler';

import { handleConfig } from '@/features/externalAPI/externalAPI';
import { ApiResponse, generateSessionId, sendError } from '@/features/externalAPI/utils/apiHelper';
import { transcribeVoice } from '@/features/externalAPI/processors/voiceProcessor';
import { processImage } from '@/features/externalAPI/processors/imageProcessor';


// Configure body parsing: disable only for multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Main API handler
export default async function handler(req: NextRequest, res: NextApiResponse<ApiResponse>) {
  // Syncing config to be accessible from server side
  await handleConfig("fetch");
  
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

    apiLogs.push({sessionId: sessionId,timestamp,inputType,outputType,response});
    res.status(200).json({ sessionId, outputType, response });
  } catch (error) {
    apiLogs.push({sessionId: sessionId,timestamp,inputType,outputType: "Error",error: String(error)});
    sendError(res, sessionId, String(error), 500);
  }
}