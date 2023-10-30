import { useState } from "react";

export interface MessageEventHandler {
  (event: MessageEvent): void;
}

export function useWorker(
  workerType: string,
  messageEventHandler: MessageEventHandler
): Worker {
  // Create new worker once and never again
  const [worker] = useState(() => createWorker(workerType, messageEventHandler));
  return worker;
}

function createWorker(
  workerType: string,
  messageEventHandler: MessageEventHandler
): Worker {
  if (workerType === "whisper") {
    const worker = new Worker(new URL("../workers/whisper.js", import.meta.url), {
      type: "module",
    });
    // Listen for messages from the Web Worker
    worker.addEventListener("message", messageEventHandler);
    return worker;
  }

  throw new Error('workerType not found');
}
