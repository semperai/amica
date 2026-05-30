import type { NextApiRequest, NextApiResponse } from "next";
import { spawn } from "child_process";

import { handleConfig } from "@/features/externalAPI/externalAPI";
import { config } from "@/utils/config";
import { Message } from "@/features/chat/messages";

function getLastUserMessage(messages: Message[] | undefined): string {
  if (!Array.isArray(messages)) {
    return "";
  }

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "user") {
      return messages[i].content;
    }
  }

  return "";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await handleConfig("fetch");

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body ?? {};
  const rawText = typeof body.text === "string" ? body.text : "";
  const text = rawText.trim() || getLastUserMessage(body.messages);

  if (!text.trim()) {
    res.status(400).json({ error: "Missing text" });
    return;
  }

  const repoRoot = config("deiphobe_repo_root");
  const command = config("deiphobe_command");
  const userId = config("deiphobe_user_id");
  const sessionId = config("deiphobe_session_id");
  const namespace = config("deiphobe_namespace");
  const timeoutSeconds = Number.parseInt(
    config("deiphobe_timeout_seconds") || "120",
    10,
  );

  console.debug("[Amica Deiphobe] starting", {
    repoRoot,
    command,
    userId,
    sessionId,
    namespace,
    timeoutSeconds,
    text,
  });

  const env = {
    ...process.env,
    DEIPHOBE_CHAT_USER_ID: userId,
    DEIPHOBE_CHAT_SESSION_ID: sessionId,
    DEIPHOBE_CHAT_NAMESPACE: namespace,
  };

  const child = spawn(command, ["chat", "--text", text], {
    cwd: repoRoot,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stdout = "";
  let stderr = "";
  let started = false;
  const timeoutMs = Number.isFinite(timeoutSeconds) && timeoutSeconds > 0
    ? timeoutSeconds * 1000
    : 120000;
  const timeout = setTimeout(() => {
    console.warn("[Amica Deiphobe] timeout reached, killing child process");
    child.kill("SIGKILL");
  }, timeoutMs);

  const startResponse = () => {
    if (started) {
      return;
    }
    started = true;
    res.status(200);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
  };

  child.once("spawn", () => {
    console.debug("[Amica Deiphobe] child spawned");
    startResponse();
  });

  child.stdout.on("data", (chunk: Buffer) => {
    const textChunk = chunk.toString("utf-8");
    stdout += textChunk;
    startResponse();
    res.write(textChunk);
  });

  child.stderr.on("data", (chunk: Buffer) => {
    const textChunk = chunk.toString("utf-8");
    stderr += textChunk;
    console.error("[Amica Deiphobe] stderr", textChunk.trimEnd());
  });

  child.on("error", (error) => {
    clearTimeout(timeout);
    console.error("[Amica Deiphobe] spawn error", error);
    if (!started && !res.headersSent) {
      res.status(500);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
    }
    if (!res.writableEnded) {
      res.status(500);
      res.end(`Deiphobe execution failed: ${(error as Error).message}`);
    }
  });

  child.on("close", (code, signal) => {
    clearTimeout(timeout);

    if (code === 0) {
      if (!res.writableEnded) {
        res.end();
      }
      return;
    }

    const message =
      stderr.trim() ||
      stdout.trim() ||
      `Deiphobe exited with code ${code ?? "unknown"}${signal ? ` signal ${signal}` : ""}`;

    console.error("[Amica Deiphobe] failed", {
      code,
      signal,
      message,
    });

    if (!started && !res.headersSent) {
      res.status(500);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
    }

    if (!res.writableEnded) {
      res.end(message);
    }
  });
}
