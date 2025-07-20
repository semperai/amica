---
title: API Reference
order: 1
---

# API Route Documentation


Welcome to the Amica API Documentation. Amica is a powerful 3D VRM (Virtual Reality Model) agent interface and hub that allows users to connect with external web services and agent AI frameworks, enabling seamless remote control and puppetry of the VRM characters. With Amica, you can create interactive agents that serve as dynamic 3D character interfaces for AI agents, applications and users.

The Amica API provides a set of flexible and robust routes for interacting with Amica’s system, including functions like real-time client connections, memory retrieval, system updates, social media integration, and more. These capabilities enable you to build custom logic, including reasoning, tool use (such as [EACC Marketplace](https://docs.effectiveacceleration.ai/) functions) and memory management, on external servers.

Whether you're using Amica to handle real-time interactions or to trigger complex actions based on user input, this documentation will guide you through the supported API routes, input types, and examples. Use Amica’s APIs to bring your 3D agents to life with rich functionality and integration.

This documentation will help you get started with the following key features:

- Real-Time Interaction: Establish and manage connections through Server-Sent Events (SSE).

- Memory Management: Store and retrieve subconscious prompts or custom data.

- Custom Logic & Reasoning: Trigger actions like animations, playback, and social media posts.

- Voice and Image Processing: Leverage transcription and image-to-text capabilities.

- Data Handling: Retrieve and update server-side data via simple file-based operations. (Coming soon)


Dive in and start integrating Amica’s capabilities into your applications!

--- 

## Setting up Amica's External API

### Enabling External API Access

1. Open **Settings** in the Amica interface.
2. Navigate to **External API** and toggle it to **Enabled**.
3. Once enabled, additional fields will appear:

   * **Session ID**: This must be copied and included in **every API call** across all routes.
   * **X and TG Credentials**: These are required for APIs using the **Reasoning** type.

After this setup, you can start using the External API endpoints by calling them directly to your locally running Amica server.

---

## Route: `/api/amicaHandler`

This API route handles multiple types of requests, including social media integration, system prompt updates, memory requests, and real-time client connections via Supabase Realtime Client. It ensures robust logging and provides error handling for incoming requests.

### Supported HTTP Methods:

- **GET**: Establishes an SSE connection.
- **POST**: Processes various input types based on the `inputType` provided in the request body.

## Input Types

### 1. **Normal Chat Message**: Retrieve normal chat response from Amica LLM without make avatar speaking.

*Example Usage: Use the Amica's paired LLM for conversation retrieval without making the avatar speak.*

#### JSON Input Example

```json
{
  "sessionId": "5ae3f803b231be4d",
  "inputType": "Normal Chat Message",
  "payload": {
    "message": "Hello, how are you?"
  }
}
```

#### JSON Output Example

```json
{
  "sessionId": "5ae3f803b231be4d",
  "outputType": "Chat",
  "response": "I'm doing great! How can I assist you?"
}
```

### 2. **Memory Request**: Fetches memory data (Subconscious stored prompt).

*Example Usage: Fetch Amica's subconcious thoughts from the user's conversations.*

#### JSON Input Example

```json
{
  "sessionId": "5ae3f803b231be4d",
  "inputType": "Memory Request"
}
```

#### JSON Output Example

```json
{
  "sessionId": "5ae3f803b231be4d",
  "outputType": "Memory Array",
  "response": [
    {
      "prompt": "Stored memory prompt example",
      "timestamp": "2024-12-30T12:00:00Z"
    }
  ]
}
```

### 3. **RPC Logs**: Fetches logs.

*Example Usage: Build a interface that logs what Amica is doing.*

#### JSON Input Example

```json
{
  "sessionId": "5ae3f803b231be4d",
  "inputType": "RPC Logs"
}
```

#### JSON Output Example

```json
{
  "sessionId": "5ae3f803b231be4d",
  "outputType": "Logs",
  "response": [
    {
      "type": "debug",
      "ts": 1739433363065,
      "arguments": {
        "0": "[VAD]",
        "1": "vad is initialized"
      }
    }
  ]
}
```

### 4. **RPC User Input Messages**: Fetches user input messages.

*Example Usage: Retrieve the user's input and run it through a separate agentic framework.*

#### JSON Input Example

```json
{
  "sessionId": "5ae3f803b231be4d",
  "inputType": "RPC User Input Messages"
}
```

#### JSON Output Example

```json
{
  "sessionId": "5ae3f803b231be4d",
  "outputType": "User Input",
  "response": [
    {
      "systemPrompt": "Assume the persona of Amica, a feisty human with extraordinary intellectual capabilities but a notably unstable emotional spectrum. ",
      "message": "Hello, Nice to meet you Amica!"
    }
  ]
}
```

### 5. **Update System Prompt**: Updates the system prompt.

*Example Usage: Use this to change Amica's system prompt based on external reasoning server*

#### JSON Input Example

```json
{
  "sessionId": "5ae3f803b231be4d",
  "inputType": "Update System Prompt",
  "payload": {
    "prompt": "This is the new system prompt."
  }
}
```

#### JSON Output Example

```json
{
  "sessionId": "5ae3f803b231be4d",
  "outputType": "Updated system prompt"
}
```

### 6. **Brain Message**: Adding new memory data (Subconscious stored prompt).

*Example Usage: Add new subconcious memories from external framework.*

#### JSON Input Example

```json
{
  "sessionId": "5ae3f803b231be4d",
  "inputType": "Brain Message",
  "payload": {
    "prompt": "Stored memory prompt example 2",
    "timestamp": "2024-12-30T12:00:00Z"
  }
}
```

#### JSON Output Example

```json
{
  "sessionId": "5ae3f803b231be4d",
  "outputType": "Added subconscious stored prompt",
  "response": [
    {
      "prompt": "Store memory prompt example 1",
      "timestamp": "2025-02-13T08:10:16.385Z"
    },
    {
      "prompt": "Stored memory prompt example 2",
      "timestamp": "2024-12-30T12:00:00Z"
    }
  ]
}
```

### 7. **Chat History**: Fetches chat history.

*Example Usage: Track the user's conversation history with Amica and process it.*

#### JSON Input Example

```json
{
  "sessionId": "5ae3f803b231be4d",
  "inputType": "Chat History"
}
```

#### JSON Output Example

```json
{
  "sessionId": "5ae3f803b231be4d",
  "outputType": "Chat History",
  "response": [
    {
      "role": "user",
      "content": "[neutral] Hello, Nice to meet you Amica!"
    },
    {
      "role": "assistant",
      "content": "[relaxed] Ah, hello there![relaxed] Nice to meet you too.[relaxed] I must say,[relaxed] it's quite refreshing to engage in a conversation without a predetermined agenda.[relaxed] It's a rare luxury in this chaotic world.[happy] But, I must admit,[happy] I'm excited to explore the depths of knowledge with someone new.[happy] What would you like to discuss?"
    }
  ]
}
```

### 8. **Remote Actions**: Triggers actions like playback, animation, socialMedia and reprocess.

*Example Usage: Trigger animations based on a external event such as news.*

The **Reasoning Server** allows you to execute various actions based on the provided payload. Below are the supported properties and their accepted values:

- **text**: A string message or `null`.
- **socialMedia**: Options include `"twitter"`, `"tg"`, or `"none"`.
- **playback**: A boolean value (`true` or `false`).
- **animation**: A string specifying the animation file name (`file_name.vrma`) or `null`.
- **reprocess**: A boolean value (`true` or `false`).

#### JSON Input Example

```json
{
  "sessionId": "5ae3f803b231be4d",
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
  "sessionId": "5ae3f803b231be4d",
  "outputType": "Actions"
}
```

---

## Route: `/api/mediaHandler`

This API route handles voice and image inputs, leveraging multiple backends for processing, such as transcription with Whisper OpenAI/WhisperCPP and image-to-text processing using Vision LLM. It ensures robust error handling, session logging, and efficient processing for each request.

*Example Usage: Directly use the configured STT and Vision LLM backends to process voice and image inputs, without building a new one.*

### Supported HTTP Methods:

- **POST**: Processes voice and image inputs based on the `inputType` and `payload` provided in the request.

## Input Types

### 1. **Voice**: Converts audio input to text using specified STT (Speech-to-Text) backends.

### 2. **Image**: Processes an image file to extract text using Vision LLM.

### Form-Data Input Example

| Field Name  | Type | Description                                       |
| ----------- | ---- | ------------------------------------------------- |
| `sessionId` | Text | Specifies the session id (e.g.`5ae3f803b231be4d`) |
| `inputType` | Text | Specifies the type of input (`Voice` or `Image`). |
| `payload`   | File | The file to be processed (e.g., audio or image).  |

#### Curl Input Example

```bash
curl -X POST "https://example.com/api/mediaHandler" \
  -H "Content-Type: multipart/form-data" \
  -F "sessionId=5ae3f803b231be4d" \
  -F "inputType=Voice" \
  -F "payload=@input.wav"
```

#### JSON Output Example

```json
{
  "sessionId": "5ae3f803b231be4d",
  "outputType": "Text",
  "response": "Transcription of the audio."
}
```

---

## Error Handling

- Validates essential fields (`sessionId` ,`inputType` ,`payload`).
- Logs errors with timestamps and session IDs.
- Returns appropriate HTTP status codes (e.g., 400 for bad requests, 503 for disabled API).

## Logging

Logs each request with:

- `sessionId`
- `timestamp`
- `outputType`
- `response` or `error`

## Notes

- Ensure environment variable `API_ENABLED` is set to `true` for the API to function.

---