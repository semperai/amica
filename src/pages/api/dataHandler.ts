import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Define file paths
const configFilePath = path.resolve('config.json');
const subconsciousFilePath = path.resolve('src/features/amicaLife/subconscious.json');
const logsFilePath = path.resolve('logs.json');
const userInputMessagesFilePath = path.resolve('src/features/chat/userInputMessages.json');

// Utility functions for file operations
const readFile = (filePath: string): any => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error);
    throw new Error(`Failed to read file: ${error}`);
  }
};

const writeFile = (filePath: string, content: any): void => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing file at ${filePath}:`, error);
    throw new Error(`Failed to write file: ${error}`);
  }
};

// Clear subconscious data on startup
writeFile(subconsciousFilePath, []);
writeFile(logsFilePath, []);
writeFile(userInputMessagesFilePath, []);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { type } = req.query;

  if (!['config', 'subconscious', 'logs', 'userInputMessages'].includes(type as string)) {
    return res.status(400).json({ error: 'Invalid type parameter. Use "config" or "subconscious."' });
  }

  switch (req.method) {
    case 'GET':
      return handleGetRequest(type as string, res);
    case 'POST':
      return handlePostRequest(type as string, req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Handlers
const handleGetRequest = (type: string, res: NextApiResponse) => {
  try {
    let filePath;
    if (type === 'config') {
      filePath = configFilePath;
    } else if (type === 'subconscious') {
      filePath = subconsciousFilePath;
    } else if (type === 'userInputMessages'){
      filePath = userInputMessagesFilePath;
    } else {
      filePath = logsFilePath;
    }
    const data = readFile(filePath);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const handlePostRequest = (type: string, req: NextApiRequest, res: NextApiResponse) => {
  const { body } = req;

  try {
    if (type === 'config') {
      updateConfig(body, res);
    } else if (type === 'subconscious') {
      updateSubconscious(body, res);
    } else if (type === 'userInputMessages') {
      updateUserInputMessages(body,res);
    } else {
      updateLogs(body,res);
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

// Sub-functions
const updateConfig = (body: any, res: NextApiResponse) => {
  if (!body || (typeof body !== 'object' && !Array.isArray(body))) {
    return res.status(400).json({ error: 'Body must be an object or array of key-value pairs.' });
  }

  const config = readFile(configFilePath);

  // Handle single key-value update
  if (body.key && body.value !== undefined) {
    const { key, value } = body;
    if (!config.hasOwnProperty(key)) {
      return res.status(400).json({ error: `Config key "${key}" not found.` });
    }

    config[key] = value;
    writeFile(configFilePath, config);
    return res.status(200).json({ message: 'Config updated successfully.' });
  }

  // Handle multiple key-value updates
  if (typeof body === 'object' && !Array.isArray(body)) {
    for (const [key, value] of Object.entries(body)) {
      if (!config.hasOwnProperty(key)) {
        console.log("body : ",key,config)
        return res.status(400).json({ error: `Config key "${key}" not found.` });
      }
      config[key] = value;
    }
    writeFile(configFilePath, config);
    return res.status(200).json({ message: 'Config updated successfully.' });
  }

  return res.status(400).json({ error: 'Invalid body format. Please provide either a key-value pair or an object with multiple key-value pairs.' });
};


const updateSubconscious = (body: any, res: NextApiResponse) => {
  const { subconscious } = body;

  if (!Array.isArray(subconscious)) {
    return res.status(400).json({ error: 'Subconscious data must be an array.' });
  }

  writeFile(subconsciousFilePath, subconscious);
  res.status(200).json({ message: 'Subconscious data updated successfully.' });
};

const updateUserInputMessages = (body: any, res: NextApiResponse) => {
  try {
    let existingMessage = readFile(userInputMessagesFilePath);

    // If the file is empty or doesn't contain an array, initialize it as an empty array
    if (!Array.isArray(existingMessage)) {
      existingMessage = [];
    }

    existingMessage.push(body);

    writeFile(userInputMessagesFilePath, existingMessage);

    // Send a success response
    res.status(200).json({ message: 'userInputMessages updated successfully.' });
  } catch (error) {
    console.error("Error updating userInputMessages:", error);
    res.status(500).json({ error: 'Failed to update userInputMessages.' });
  }

};


const updateLogs = (body: any, res: NextApiResponse) => {
  // The body should be an object that contains type, ts, and arguments
  const { type, ts, arguments: logArguments } = body;

  // Log entry format
  const logEntry = {
    type,
    ts,
    arguments: logArguments,
  };

  try {
    // Read the existing logs from the file
    let existingLogs = readFile(logsFilePath);

    // If the file is empty or doesn't contain an array, initialize it as an empty array
    if (!Array.isArray(existingLogs)) {
      existingLogs = [];
    }

    // Append the new log entry
    existingLogs.push(logEntry);

    // Write the updated logs back to the file
    writeFile(logsFilePath, existingLogs);

    // Send a success response
    res.status(200).json({ message: 'Logs updated successfully.' });
  } catch (error) {
    console.error("Error updating logs:", error);
    res.status(500).json({ error: 'Failed to update logs.' });
  }
};

