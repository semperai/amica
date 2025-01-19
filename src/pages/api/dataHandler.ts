import type { NextApiRequest, NextApiResponse } from 'next';
import { writeFile } from '@/features/externalAPI/utils/apiHelper';
import { handleGetConfig, handleGetLogs, handleGetSubconscious, handleGetUserInputMessages, handlePostConfig, handlePostLogs, handlePostSubconscious, handlePostUserInputMessages, logsFilePath, subconsciousFilePath, userInputMessagesFilePath } from '@/features/externalAPI/dataHelper';

// Clear data on startup
writeFile(subconsciousFilePath, []);
writeFile(logsFilePath, []);
writeFile(userInputMessagesFilePath, []);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { type } = req.query;

  if (!['config', 'subconscious', 'logs', 'userInputMessages'].includes(type as string)) {
    return res.status(400).json({ error: 'Invalid type parameter. Use "config" or "subconscious."' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return handleGetRequest(type as string, res);
      case 'POST':
        return handlePostRequest(type as string, req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}

const handleGetRequest = (type: string, res: NextApiResponse) => {
    let data;
    switch (type) {
      case 'config':
        data = handleGetConfig();
        break;
      case 'subconscious':
        data = handleGetSubconscious();
        break;
      case 'logs':
        data = handleGetLogs();
        break;
      case 'userInputMessages':
        data = handleGetUserInputMessages();
        break;
      default:
        return res.status(400).json({ error: 'Invalid type' });
    }
    res.status(200).json(data);
  };
  
  const handlePostRequest = (type: string, req: NextApiRequest, res: NextApiResponse) => {
    const { body } = req;
    let response;
  
    switch (type) {
      case 'config':
        response = handlePostConfig(body);
        break;
      case 'subconscious':
        response = handlePostSubconscious(body);
        break;
      case 'userInputMessages':
        response = handlePostUserInputMessages(body);
        break;
      case 'logs':
        response = handlePostLogs(body);
        break;
      default:
        return res.status(400).json({ error: 'Invalid type' });
    }
  
    res.status(200).json(response);
  };