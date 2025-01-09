---
title: API Reference
order: 1
---

# API Route Documentation

Introduction
Welcome to the Amica API Documentation. Amica is a powerful 3D VRM (Virtual Reality Model) agent interface and hub that allows users to connect with external web services and servers, enabling seamless remote control and puppetry of the VRM characters. With Amica, you can create interactive agents that serve as dynamic 3D character interfaces for applications and users.

The Amica API provides a set of flexible and robust routes for interacting with Amica’s system, including functions like real-time client connections, memory retrieval, system updates, social media integration, and more. These capabilities enable you to build custom logic, including reasoning and memory management, on external servers.

Whether you're using Amica to handle real-time interactions or to trigger complex actions based on user input, this documentation will guide you through the supported API routes, input types, and examples. Use Amica’s APIs to bring your 3D agents to life with rich functionality and integration.

This documentation will help you get started with the following key features:

- Real-Time Interaction: Establish and manage connections through Server-Sent Events (SSE).

- Memory Management: Store and retrieve subconscious prompts or custom data.

- Custom Logic & Reasoning: Trigger actions like animations, playback, and social media posts.

- Voice and Image Processing: Leverage transcription and image-to-text capabilities.

- Data Handling: Retrieve and update server-side data via simple file-based operations. (Coming soon)


Dive in and start integrating Amica’s capabilities into your applications!

--- 

## Route: `/api/amicaHandler`

This API route handles multiple types of requests, including social media integration, system prompt updates, memory requests, and real-time client connections via Server-Sent Events (SSE). It ensures robust logging and provides error handling for incoming requests.

### Supported HTTP Methods:

- **GET**: Establishes an SSE connection.
- **POST**: Processes various input types based on the `inputType` provided in the request body.

## Input Types

### 1. **Normal Chat Message**: Retrieve normal chat response from Amica LLM without make avatar speaking.

#### JSON Input Example

```json
{
  "inputType": "Normal Chat Message",
  "payload": {
    "message": "Hello, how are you?"
  }
}
```

#### JSON Output Example

```json
{
  "outputType": "Complete stream",
  "response": "I'm doing great! How can I assist you?"
}
```

### 2. **Memory Request**: Fetches memory data (Subconscious stored prompt).

#### JSON Input Example

```json
{
  "inputType": "Memory Request"
}
```

#### JSON Output Example

```json
{
  "outputType": "Memory Array",
  "response": [
    {
      "timestamp": "2024-12-30T12:00:00Z",
      "prompt": "Stored memory prompt example"
    }
  ]
}
```

### 3. **RPC Logs**: Fetches logs.

#### JSON Input Example

```json
{
  "inputType": "RPC Logs"
}
```

#### JSON Output Example

```json
{
  "outputType": "Webhook",
  "response": [
    {
      "sessionId": "a1b2c3d4e5f6g7h8",
      "timestamp": "2024-12-30T12:00:00Z",
      "inputType": "Normal Chat Message",
      "outputType": "Complete stream",
      "response": "I'm doing great! How can I assist you?"
    }
  ]
}
```

### 4. **RPC User Input Messages**: Fetches user input messages.

#### JSON Input Example

```json
{
  "inputType": "RPC User Input Messages"
}
```

#### JSON Output Example

```json
{
  "outputType": "Webhook",
  "response": [
    {
      "message": "What is the weather today?",
      "timestamp": "2024-12-30T12:05:00Z"
    }
  ]
}
```

### 5. **Update System Prompt**: Updates the system prompt.

#### JSON Input Example

```json
{
  "inputType": "Update System Prompt",
  "payload": {
    "prompt": "This is the new system prompt."
  }
}
```

#### JSON Output Example

```json
{
  "outputType": "Updated system prompt",
  "response": "System prompt updated successfully."
}
```

### 6. **Twitter Message / Brain Message**: Posts to social media or returns a simple text.

#### JSON Input Example

```json
{
  "inputType": "Twitter Message",
  "payload": {
    "text": "Excited to share this update!"
  }
}
```

#### JSON Output Example

```json
{
  "outputType": "Text",
  "response": "Posted to Twitter: 'Excited to share this update!'"
}
```

### 7. **Reasoning Server**: Triggers actions like playback, animation, socialMedia and reprocess.

The **Reasoning Server** allows you to execute various actions based on the provided payload. Below are the supported properties and their accepted values:

- **text**: A string message or `null`.  
- **socialMedia**: Options include `"twitter"`, `"tg"`, or `"none"`.  
- **playback**: A boolean value (`true` or `false`).  
- **animation**: A string specifying the animation file name (`file_name.vrma`) or `null`.  
- **reprocess**: A boolean value (`true` or `false`).  

#### JSON Input Example

```json
{
  "inputType": "Reasoning Server",
  "payload": {
    "text": "Let's begin the presentation.",
    "socialMedia": "twitter",
    "playback": true,
    "animation": "dance.vrma",
    "reprocess": false
  }
}
```

#### JSON Output Example

```json
{
  "outputType": "Action Triggered",
  "response": {
    "playback": "Broadcasted to clients",
    "animation": "dance.vrma executed"
  }
}
```

---

## Route: `/api/mediaHandler`

This API route handles voice and image inputs, leveraging multiple backends for processing, such as transcription with Whisper OpenAI/WhisperCPP and image-to-text processing using Vision LLM. It ensures robust error handling, session logging, and efficient processing for each request.

### Supported HTTP Methods:

- **POST**: Processes voice and image inputs based on the `inputType` and `payload` provided in the request.


## Input Types

### 1. **Voice**: Converts audio input to text using specified STT (Speech-to-Text) backends.

### 2. **Image**: Processes an image file to extract text using Vision LLM.

### Form-Data Input Example

| Field Name    | Type          | Description                                |
|---------------|---------------|--------------------------------------------|
| `inputType`   | Text          | Specifies the type of input (`Voice` or `Image`). |
| `payload`     | File          | The file to be processed (e.g., audio or image). |

#### Curl Input Example 

```bash
curl -X POST "https://example.com/api/mediaHandler" \
  -H "Content-Type: multipart/form-data" \
  -F "inputType=Voice" \
  -F "payload=@input.wav"
```

#### JSON Output Example

```json
{
  "sessionId": "a1b2c3d4e5f6g7h8",
  "outputType": "Text",
  "response": "Transcription of the audio."
}
```

---

## Error Handling

- Validates essential fields (`inputType`, `payload`).
- Logs errors with timestamps and session IDs.
- Returns appropriate HTTP status codes (e.g., 400 for bad requests, 503 for disabled API).


## Logging

Logs each request with:

- `sessionId`
- `timestamp`
- `inputType`
- `outputType`
- `response` or `error`


## Notes

- Ensure environment variable `API_ENABLED` is set to `true` for the API to function.
- The SSE connection remains active until the client disconnects.

---

## Route: `/api/dataHandler`

This API route is used to retrieve and update client-side information through server-side operations. Since the application cannot directly update or retrieve data from the server side, these operations involve writing and reading data from static files that are continuously updated.

The primary purpose of this route is to utilize the data written to files for operations performed in the /api/mediaHandler and /api/amicaHandler routes.

### File Paths

1. **`config.json`**
   - **Path**: `config.json` (Root directory)
   - **Description**: Contains the configuration data used throughout the application. This file is read and updated dynamically by the API.

2. **`subconscious.json`**
   - **Path**: `src/features/amicaLife/subconscious.json`
   - **Description**: Stores data related to subconscious operations. It is cleared on startup and updated via the API.

3. **`logs.json`**
   - **Path**: `logs.json` (Root directory)
   - **Description**: Keeps track of log entries, including types, timestamps, and arguments. The data is cleared on startup and updated via the API.

4. **`userInputMessages.json`**
   - **Path**: `src/features/chat/userInputMessages.json`
   - **Description**: Maintains user input messages for chat functionalities. Data is cleared on startup and appended to this file through the API.


### Features

- **Retrieve data**: Supports fetching configurations, subconscious data, logs, and user input messages.
- **Update data**: Enables modifications to configurations, subconscious data, logs, and user input messages.


#### **GET**
Retrieve specific data from the server.

- **Query Parameters**:
  - `type` (required): Specifies the type of data to retrieve. Accepted values: `config`, `subconscious`, `logs`, `userInputMessages`.

- **Example Request**:
  ```bash
  curl -X GET "http://localhost:3000/api/dataHandler?type=config"
  ```


#### **POST**
Update data on the server.

- **Query Parameters**:
  - `type` (required): Specifies the type of data to update. Accepted values: `config`, `subconscious`, `logs`, `userInputMessages`.

- **Example Request**:
  ```bash
  curl -X POST "http://localhost:3000/api/dataHandler?type=config" \
    -H "Content-Type: application/json" \
    -d '{"key": "exampleKey", "value": "exampleValue"}'
  ```

---