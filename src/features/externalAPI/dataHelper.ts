import { readFile, writeFile } from './utils/apiHelper';
import path from 'path';

// Define file paths
export const configFilePath = path.resolve('src/features/externalAPI/dataHandlerStorage/config.json');
export const subconsciousFilePath = path.resolve('src/features/externalAPI/dataHandlerStorage/subconscious.json');
export const logsFilePath = path.resolve('src/features/externalAPI/dataHandlerStorage/logs.json');
export const userInputMessagesFilePath = path.resolve('src/features/externalAPI/dataHandlerStorage/userInputMessages.json');

// GET Request Handlers
export const handleGetConfig = () => readFile(configFilePath);
export const handleGetSubconscious = () => readFile(subconsciousFilePath);
export const handleGetLogs = () => readFile(logsFilePath);
export const handleGetUserInputMessages = () => readFile(userInputMessagesFilePath);

// POST Request Handlers
export const handlePostConfig = (body: any) => updateConfig(body);
export const handlePostSubconscious = (body: any) => updateSubconscious(body);
export const handlePostUserInputMessages = (body: any) => updateUserInputMessages(body);
export const handlePostLogs = (body: any) => updateLogs(body);

// Update Functions
const updateConfig = (body: any) => {
  const config = readFile(configFilePath);
  if (body.key && body.value !== undefined) {
    const { key, value } = body;
    if (!config.hasOwnProperty(key)) {
      throw new Error(`Config key "${key}" not found.`);
    }
    config[key] = value;
    writeFile(configFilePath, config);
    return { message: 'Config updated successfully.' };
  }

  if (typeof body === 'object' && !Array.isArray(body)) {
    for (const [key, value] of Object.entries(body)) {
      config[key] = value;
    }
    writeFile(configFilePath, config);
    return { message: 'Config updated successfully.' };
  }

  throw new Error('Invalid body format.');
};

const updateSubconscious = (body: any) => {
  if (!Array.isArray(body.subconscious)) {
    throw new Error('Subconscious data must be an array.');
  }
  writeFile(subconsciousFilePath, body.subconscious);
  return { message: 'Subconscious data updated successfully.' };
};

const updateUserInputMessages = (body: any) => {
  let existingMessage = readFile(userInputMessagesFilePath);
  if (!Array.isArray(existingMessage)) {
    existingMessage = [];
  }
  existingMessage.push(body);
  writeFile(userInputMessagesFilePath, existingMessage);
  return { message: 'User input messages updated successfully.' };
};

const updateLogs = (body: any) => {
  const { type, ts, arguments: logArguments } = body;
  const logEntry = { type, ts, arguments: logArguments };
  let existingLogs = readFile(logsFilePath);
  if (!Array.isArray(existingLogs)) {
    existingLogs = [];
  }
  existingLogs.push(logEntry);
  writeFile(logsFilePath, existingLogs);
  return { message: 'Logs updated successfully.' };
};
