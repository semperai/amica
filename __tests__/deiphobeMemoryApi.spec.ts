import { describe, expect, jest, test, beforeEach } from "@jest/globals";
import { EventEmitter } from "node:events";

const mockConfigValues: Record<string, string> = {
  deiphobe_repo_root: "/home/kyler/ClawDawg",
  deiphobe_timeout_seconds: "5",
  deiphobe_user_id: "uther-voice",
  deiphobe_session_id: "voice-avatar-test",
  deiphobe_namespace: "voice",
  deiphobe_private_mode: "true",
  deiphobe_private_memory_root: "/tmp/private-memory",
};

const mockSpawn = jest.fn();
const mockHandleConfig = jest.fn().mockResolvedValue(undefined);

jest.mock("child_process", () => ({
  spawn: (...args: unknown[]) => mockSpawn(...args),
}));

jest.mock("../src/features/externalAPI/externalAPI", () => ({
  handleConfig: (...args: unknown[]) => mockHandleConfig(...args),
}));

jest.mock("../src/utils/config", () => ({
  config: (key: string) => mockConfigValues[key] ?? "",
}));

function createMockChildProcess(stdout = "", stderr = "", code = 0) {
  const child = new EventEmitter() as any;
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.kill = jest.fn();
  mockSpawn.mockReturnValue(child);

  process.nextTick(() => {
    if (stdout) {
      child.stdout.emit("data", Buffer.from(stdout));
    }
    if (stderr) {
      child.stderr.emit("data", Buffer.from(stderr));
    }
    child.emit("close", code);
  });

  return child;
}

function createResponse() {
  const response: Record<string, any> = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined,
    setHeader(name: string, value: string | string[]) {
      this.headers[name] = Array.isArray(value) ? value.join(",") : value;
      return this;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    },
    end(payload?: any) {
      this.body = payload;
      return this;
    },
  };

  return response;
}

beforeEach(() => {
  mockSpawn.mockReset();
  mockHandleConfig.mockClear();
});

describe("parsePrivateMemoryCandidatesOutput", () => {
  test("parses a normal candidate line", async () => {
    const apiModule = await import("../src/pages/api/deiphobeMemory");

    expect(
      apiModule.parsePrivateMemoryCandidatesOutput(
        "cand_1 | project_memory | private | candidate | 2026-05-31T10:11:12Z | Prefer private candidate intake.",
      ),
    ).toEqual([
      {
        id: "cand_1",
        type: "project_memory",
        sensitivity: "private",
        status: "candidate",
        createdAt: "2026-05-31T10:11:12Z",
        claim: "Prefer private candidate intake.",
      },
    ]);
  });

  test("treats the no-candidates message as an empty list", async () => {
    const apiModule = await import("../src/pages/api/deiphobeMemory");

    expect(apiModule.parsePrivateMemoryCandidatesOutput("No private memory candidates found.")).toEqual([]);
  });
});

describe("deiphobeMemory handler", () => {
  test("rejects unsupported methods", async () => {
    const apiModule = await import("../src/pages/api/deiphobeMemory");
    const req = { method: "DELETE" } as any;
    const res = createResponse();

    await apiModule.default(req, res as any);

    expect(res.statusCode).toBe(405);
    expect(res.headers.Allow).toBe("GET,POST");
    expect(res.body).toEqual({ error: "Method not allowed" });
  });

  test("rejects unsupported actions", async () => {
    const apiModule = await import("../src/pages/api/deiphobeMemory");
    const req = { method: "GET", query: { action: "bogus" } } as any;
    const res = createResponse();

    await apiModule.default(req, res as any);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Unsupported action" });
  });

  test("returns private mode status", async () => {
    const apiModule = await import("../src/pages/api/deiphobeMemory");
    const req = { method: "GET", query: { action: "status" } } as any;
    const res = createResponse();

    await apiModule.default(req, res as any);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      privateMode: true,
      privateMemoryRootConfigured: true,
      privateMemoryRoot: "/tmp/private-memory",
    });
  });

  test("returns status and candidate data", async () => {
    const apiModule = await import("@/pages/api/deiphobeMemory");
    createMockChildProcess(
      "cand_1 | project_memory | private | candidate | 2026-05-31T10:11:12Z | Prefer private candidate intake.\n",
    );

    const req = { method: "GET", query: { action: "candidates" } } as any;
    const res = createResponse();

    await apiModule.default(req, res as any);

    expect(mockSpawn).toHaveBeenCalledWith(
      "python3",
      ["./ops/scripts/memory/private_memory_candidates.py", "list"],
      expect.objectContaining({
        cwd: "/home/kyler/ClawDawg",
        env: expect.objectContaining({
          DEIPHOBE_CHAT_USER_ID: "uther-voice",
          DEIPHOBE_CHAT_SESSION_ID: "voice-avatar-test",
          DEIPHOBE_CHAT_NAMESPACE: "voice",
          DEIPHOBE_PRIVATE_MODE: "1",
          DEIPHOBE_PRIVATE_MEMORY_ROOT: "/tmp/private-memory",
        }),
      }),
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      candidates: [
        {
          id: "cand_1",
          type: "project_memory",
          sensitivity: "private",
          status: "candidate",
          createdAt: "2026-05-31T10:11:12Z",
          claim: "Prefer private candidate intake.",
        },
      ],
    });
  });

  test.each([
    ["approve", ["approve", "cand_1"]],
    ["reject", ["reject", "cand_1", "--reason", "not needed"]],
    ["approve-and-promote", ["approve-and-promote", "cand_1"]],
    ["promote", ["promote", "cand_1"]],
  ] as const)("invokes the expected script for %s", async (action, expectedArgs) => {
    const apiModule = await import("@/pages/api/deiphobeMemory");
    createMockChildProcess("ok\n");

    const req =
      action === "reject"
        ? ({ method: "POST", body: { action, candidateId: "cand_1", reason: "not needed" } } as any)
        : ({ method: "POST", body: { action, candidateId: "cand_1" } } as any);
    const res = createResponse();

    await apiModule.default(req, res as any);

    expect(mockSpawn).toHaveBeenCalledWith(
      "python3",
      ["./ops/scripts/memory/private_memory_candidates.py", ...expectedArgs],
      expect.any(Object),
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true, output: "ok\n" });
  });
});
