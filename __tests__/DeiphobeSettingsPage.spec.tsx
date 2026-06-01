import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";

const mockConfigValues: Record<string, string> = {
  chatbot_backend: "deiphobe",
};

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

jest.mock("../src/utils/config", () => ({
  config: (key: string) => mockConfigValues[key] ?? "",
  updateConfig: jest.fn(),
}));

jest.mock("../src/components/settings/common", () => ({
  BasicPage: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormRow: ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label>
      <span>{label}</span>
      {children}
    </label>
  ),
  NotUsingAlert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("DeiphobeSettingsPage private memory panel", () => {
  const fetchMock = jest.fn();
  const originalFetch = global.fetch;
  const originalActEnvironment = (globalThis as any).IS_REACT_ACT_ENVIRONMENT;
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
    fetchMock.mockReset();
    global.fetch = fetchMock as any;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    global.fetch = originalFetch;
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = originalActEnvironment;
  });

  test("renders the candidate claim, badges, and action buttons", async () => {
    const { DeiphobeSettingsPage } = await import("../src/components/settings/DeiphobeSettingsPage");

    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("action=status")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            privateMode: true,
            privateMemoryRootConfigured: true,
            privateMemoryRoot: "/tmp/private-memory",
          }),
          text: async () => JSON.stringify({
            privateMode: true,
            privateMemoryRootConfigured: true,
            privateMemoryRoot: "/tmp/private-memory",
          }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
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
        }),
        text: async () => JSON.stringify({
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
        }),
      } as Response);
    });

    await act(async () => {
      root.render(
        <DeiphobeSettingsPage
          deiphobeRepoRoot="/home/kyler/ClawDawg"
          setDeiphobeRepoRoot={jest.fn()}
          deiphobeCommand="./ops/scripts/bus/deiphobe"
          setDeiphobeCommand={jest.fn()}
          deiphobeUserId="uther-voice"
          setDeiphobeUserId={jest.fn()}
          deiphobeSessionId="voice-avatar-test"
          setDeiphobeSessionId={jest.fn()}
          deiphobeNamespace="voice"
          setDeiphobeNamespace={jest.fn()}
          deiphobeTimeoutSeconds="120"
          setDeiphobeTimeoutSeconds={jest.fn()}
          deiphobePrivateMode="true"
          setDeiphobePrivateMode={jest.fn()}
          deiphobePrivateMemoryRoot="/tmp/private-memory"
          setDeiphobePrivateMemoryRoot={jest.fn()}
          setSettingsUpdated={jest.fn()}
        />,
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(container.textContent).toContain("Private Memory");
    expect(container.textContent).toContain("Prefer private candidate intake.");
    expect(container.textContent).toContain("Approve");
    expect(container.textContent).toContain("Reject");
    expect(container.textContent).toContain("Approve & Promote");
    expect(container.textContent).toContain("ON");
    expect(container.textContent).toContain("/tmp/private-memory");
    expect(container.querySelector('input[placeholder="Reject reason"]')).not.toBeNull();
  });
});
