import type { NextApiRequest, NextApiResponse } from "next";
import { spawn } from "child_process";

import { handleConfig } from "@/features/externalAPI/externalAPI";
import { config } from "@/utils/config";

export type PrivateMemoryCandidateSummary = {
  id: string;
  type: string;
  sensitivity: string;
  status: string;
  createdAt: string;
  claim: string;
};

type PrivateMemoryStatusResponse = {
  privateMode: boolean;
  privateMemoryRootConfigured: boolean;
  privateMemoryRoot: string;
};

const PRIVATE_MEMORY_SCRIPT = "./ops/scripts/memory/private_memory_candidates.py";
const TRUTHY_VALUES = new Set(["1", "true", "yes", "on"]);

function isTruthy(value: string) {
  return TRUTHY_VALUES.has(value.trim().toLowerCase());
}

function getPrivateMemoryEnv() {
  const privateMemoryRoot = config("deiphobe_private_memory_root").trim();
  const privateModeValue = config("deiphobe_private_mode");

  return {
    ...process.env,
    DEIPHOBE_CHAT_USER_ID: config("deiphobe_user_id"),
    DEIPHOBE_CHAT_SESSION_ID: config("deiphobe_session_id"),
    DEIPHOBE_CHAT_NAMESPACE: config("deiphobe_namespace"),
    DEIPHOBE_PRIVATE_MODE: isTruthy(privateModeValue) ? "1" : "0",
    ...(privateMemoryRoot ? { DEIPHOBE_PRIVATE_MEMORY_ROOT: privateMemoryRoot } : {}),
  };
}

function getTimeoutMs() {
  const timeoutSeconds = Number.parseInt(config("deiphobe_timeout_seconds") || "120", 10);
  return Number.isFinite(timeoutSeconds) && timeoutSeconds > 0 ? timeoutSeconds * 1000 : 120000;
}

function splitPipeLine(line: string): string[] {
  const parts: string[] = [];
  let remaining = line;

  for (let i = 0; i < 5; i += 1) {
    const separatorIndex = remaining.indexOf(" | ");
    if (separatorIndex < 0) {
      return [];
    }
    parts.push(remaining.slice(0, separatorIndex));
    remaining = remaining.slice(separatorIndex + 3);
  }

  parts.push(remaining);
  return parts;
}

export function parsePrivateMemoryCandidateLine(line: string): PrivateMemoryCandidateSummary {
  const parts = splitPipeLine(line.trim());
  if (parts.length !== 6) {
    throw new Error(`Invalid private memory candidate line: ${line}`);
  }

  const [id, type, sensitivity, status, createdAt, claim] = parts;
  return { id, type, sensitivity, status, createdAt, claim };
}

export function parsePrivateMemoryCandidatesOutput(stdout: string): PrivateMemoryCandidateSummary[] {
  const trimmed = stdout.trim();
  if (!trimmed || trimmed === "No private memory candidates found.") {
    return [];
  }

  return trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line !== "No private memory candidates found.")
    .map(parsePrivateMemoryCandidateLine);
}

function runPrivateMemoryCommand(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("python3", [PRIVATE_MEMORY_SCRIPT, ...args], {
      cwd: config("deiphobe_repo_root"),
      env: getPrivateMemoryEnv(),
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let finished = false;
    const timeout = setTimeout(() => {
      if (finished) {
        return;
      }
      finished = true;
      child.kill("SIGKILL");
      reject(new Error("Private memory command timed out."));
    }, getTimeoutMs());

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf-8");
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf-8");
    });

    child.on("error", (error) => {
      if (finished) {
        return;
      }
      finished = true;
      clearTimeout(timeout);
      reject(new Error(`Private memory command failed to start: ${(error as Error).message}`));
    });

    child.on("close", (code) => {
      if (finished) {
        return;
      }
      finished = true;
      clearTimeout(timeout);

      if (code === 0) {
        resolve(stdout);
        return;
      }

      const message = stderr.trim() || stdout.trim() || `Private memory command exited with code ${code ?? "unknown"}.`;
      reject(new Error(message));
    });
  });
}

async function handleStatus(res: NextApiResponse) {
  const privateMemoryRoot = config("deiphobe_private_memory_root").trim();
  const response: PrivateMemoryStatusResponse = {
    privateMode: isTruthy(config("deiphobe_private_mode")),
    privateMemoryRootConfigured: privateMemoryRoot.length > 0,
    privateMemoryRoot,
  };
  res.status(200).json(response);
}

async function handleCandidates(res: NextApiResponse) {
  const stdout = await runPrivateMemoryCommand(["list"]);
  const candidates = parsePrivateMemoryCandidatesOutput(stdout);
  res.status(200).json({ candidates });
}

async function handleAction(req: NextApiRequest, res: NextApiResponse) {
  const body = req.body ?? {};
  const action = typeof body.action === "string" ? body.action.trim() : "";
  const candidateId = typeof body.candidateId === "string" ? body.candidateId.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";

  if (!action) {
    res.status(400).json({ error: "Missing action" });
    return;
  }

  if (!candidateId) {
    res.status(400).json({ error: "Missing candidateId" });
    return;
  }

  let commandArgs: string[] | null = null;
  if (action === "approve") {
    commandArgs = ["approve", candidateId];
  } else if (action === "reject") {
    if (!reason) {
      res.status(400).json({ error: "Missing reason" });
      return;
    }
    commandArgs = ["reject", candidateId, "--reason", reason];
  } else if (action === "approve-and-promote") {
    commandArgs = ["approve-and-promote", candidateId];
  } else if (action === "promote") {
    commandArgs = ["promote", candidateId];
  }

  if (!commandArgs) {
    res.status(400).json({ error: "Unsupported action" });
    return;
  }

  const output = await runPrivateMemoryCommand(commandArgs);
  res.status(200).json({ ok: true, output });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await handleConfig("fetch");

  if (req.method === "GET") {
    const action = typeof req.query.action === "string" ? req.query.action : "";

    if (action === "status") {
      await handleStatus(res);
      return;
    }

    if (action === "candidates") {
      await handleCandidates(res);
      return;
    }

    res.status(400).json({ error: "Unsupported action" });
    return;
  }

  if (req.method === "POST") {
    await handleAction(req, res);
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: "Method not allowed" });
}
