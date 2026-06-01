import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, NotUsingAlert } from './common';
import { TextInput } from "@/components/textInput";
import { TextButton } from "@/components/textButton";
import { config, updateConfig } from "@/utils/config";

type PrivateMemoryStatus = {
  privateMode: boolean;
  privateMemoryRootConfigured: boolean;
  privateMemoryRoot: string;
};

type PrivateMemoryCandidate = {
  id: string;
  type: string;
  sensitivity: string;
  status: string;
  createdAt: string;
  claim: string;
};

export function PrivateMemoryPanel({
  privateModeSetting,
  privateMemoryRootSetting,
}: {
  privateModeSetting: string;
  privateMemoryRootSetting: string;
}) {
  const [status, setStatus] = useState<PrivateMemoryStatus | null>(null);
  const [candidates, setCandidates] = useState<PrivateMemoryCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [pendingCandidateId, setPendingCandidateId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPrivateMemory() {
      setLoading(true);
      setError("");

      try {
        const [statusResponse, candidatesResponse] = await Promise.all([
          fetch("/api/deiphobeMemory?action=status"),
          fetch("/api/deiphobeMemory?action=candidates"),
        ]);

        if (!statusResponse.ok) {
          throw new Error(await statusResponse.text());
        }
        if (!candidatesResponse.ok) {
          throw new Error(await candidatesResponse.text());
        }

        const statusData = (await statusResponse.json()) as PrivateMemoryStatus;
        const candidatesData = (await candidatesResponse.json()) as { candidates: PrivateMemoryCandidate[] };

        if (!cancelled) {
          setStatus(statusData);
          setCandidates(Array.isArray(candidatesData.candidates) ? candidatesData.candidates : []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : String(loadError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPrivateMemory();
    return () => {
      cancelled = true;
    };
  }, [privateModeSetting, privateMemoryRootSetting]);

  async function refresh() {
    setLoading(true);
    setError("");

    try {
      const [statusResponse, candidatesResponse] = await Promise.all([
        fetch("/api/deiphobeMemory?action=status"),
        fetch("/api/deiphobeMemory?action=candidates"),
      ]);

      if (!statusResponse.ok) {
        throw new Error(await statusResponse.text());
      }
      if (!candidatesResponse.ok) {
        throw new Error(await candidatesResponse.text());
      }

      setStatus((await statusResponse.json()) as PrivateMemoryStatus);
      const candidatesData = (await candidatesResponse.json()) as { candidates: PrivateMemoryCandidate[] };
      setCandidates(Array.isArray(candidatesData.candidates) ? candidatesData.candidates : []);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : String(refreshError));
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(
    action: "approve" | "reject" | "approve-and-promote" | "promote",
    candidateId: string,
  ) {
    const trimmedReason = (rejectReasons[candidateId] ?? "").trim();
    setPendingCandidateId(candidateId);
    setError("");

    try {
      const response = await fetch("/api/deiphobeMemory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          candidateId,
          ...(action === "reject" ? { reason: trimmedReason } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      if (action === "reject") {
        setRejectReasons((current) => {
          const next = { ...current };
          delete next[candidateId];
          return next;
        });
      }

      await refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : String(actionError));
    } finally {
      setPendingCandidateId(null);
    }
  }

  const privateModeOn = status?.privateMode ?? (privateModeSetting.trim().toLowerCase() === "true");
  const privateMemoryRoot = status?.privateMemoryRoot ?? privateMemoryRootSetting.trim();
  const privateMemoryRootConfigured = status?.privateMemoryRootConfigured ?? privateMemoryRoot.length > 0;

  return (
    <section className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-gray-900">Private Memory</h3>
        <div className="text-sm text-gray-700">
          Private Mode:{" "}
          <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${privateModeOn ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700"}`}>
            {privateModeOn ? "ON" : "OFF"}
          </span>
        </div>
        <div className="text-sm text-gray-700">
          Private Memory Root:{" "}
          {privateMemoryRootConfigured ? (
            <span className="font-mono text-xs text-gray-900">{privateMemoryRoot}</span>
          ) : (
            <span className="text-gray-500">Not configured</span>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading private memory candidates...</p>
        ) : candidates.length === 0 ? (
          <p className="text-sm text-gray-500">No private memory candidates found.</p>
        ) : (
          <ul className="space-y-4">
            {candidates.map((candidate) => (
              <li key={candidate.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs font-semibold text-white">
                    {candidate.type}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {candidate.sensitivity}
                  </span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    {candidate.status}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  <span className="font-mono">{candidate.id}</span>
                  <span className="mx-2">•</span>
                  <span>{candidate.createdAt}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-900">{candidate.claim}</p>

                <div className="mt-4 space-y-3">
                  <input
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-gray-400 sm:text-sm sm:leading-6"
                    type="text"
                    value={rejectReasons[candidate.id] ?? ""}
                    placeholder="Reject reason"
                    onChange={(event) => {
                      const value = event.target.value;
                      setRejectReasons((current) => ({
                        ...current,
                        [candidate.id]: value,
                      }));
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    <TextButton
                      type="button"
                      className=""
                      onClick={() => void handleAction("approve", candidate.id)}
                      disabled={pendingCandidateId === candidate.id}
                    >
                      Approve
                    </TextButton>
                    <TextButton
                      type="button"
                      className=""
                      onClick={() => void handleAction("reject", candidate.id)}
                      disabled={pendingCandidateId === candidate.id}
                    >
                      Reject
                    </TextButton>
                    <TextButton
                      type="button"
                      className=""
                      onClick={() => void handleAction("approve-and-promote", candidate.id)}
                      disabled={pendingCandidateId === candidate.id}
                    >
                      Approve &amp; Promote
                    </TextButton>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function DeiphobeSettingsPage({
  deiphobeRepoRoot,
  setDeiphobeRepoRoot,
  deiphobeCommand,
  setDeiphobeCommand,
  deiphobeUserId,
  setDeiphobeUserId,
  deiphobeSessionId,
  setDeiphobeSessionId,
  deiphobeNamespace,
  setDeiphobeNamespace,
  deiphobeTimeoutSeconds,
  setDeiphobeTimeoutSeconds,
  deiphobePrivateMode,
  setDeiphobePrivateMode,
  deiphobePrivateMemoryRoot,
  setDeiphobePrivateMemoryRoot,
  setSettingsUpdated,
}: {
  deiphobeRepoRoot: string;
  setDeiphobeRepoRoot: (value: string) => void;
  deiphobeCommand: string;
  setDeiphobeCommand: (value: string) => void;
  deiphobeUserId: string;
  setDeiphobeUserId: (value: string) => void;
  deiphobeSessionId: string;
  setDeiphobeSessionId: (value: string) => void;
  deiphobeNamespace: string;
  setDeiphobeNamespace: (value: string) => void;
  deiphobeTimeoutSeconds: string;
  setDeiphobeTimeoutSeconds: (value: string) => void;
  deiphobePrivateMode: string;
  setDeiphobePrivateMode: (value: string) => void;
  deiphobePrivateMemoryRoot: string;
  setDeiphobePrivateMemoryRoot: (value: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <BasicPage
      title={t("Deiphobe") + " " + t("Settings")}
      description={t(
        "deiphobe_desc",
        "Configure Amica to call the local Deiphobe CLI as its chatbot backend. This is a separate local voice/session lane, not Amica cloud memory.",
      )}
    >
      {config("chatbot_backend") !== "deiphobe" && (
        <NotUsingAlert>
          {t(
            "not_using_alert",
            "You are not currently using {{name}} as your {{what}} backend. These settings will not be used.",
            { name: t("Deiphobe"), what: t("ChatBot") },
          )}
        </NotUsingAlert>
      )}
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label={t("Repo Root")}>
            <TextInput
              value={deiphobeRepoRoot}
              onChange={(event: React.ChangeEvent<any>) => {
                setDeiphobeRepoRoot(event.target.value);
                updateConfig("deiphobe_repo_root", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("Command")}>
            <TextInput
              value={deiphobeCommand}
              onChange={(event: React.ChangeEvent<any>) => {
                setDeiphobeCommand(event.target.value);
                updateConfig("deiphobe_command", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("User ID")}>
            <TextInput
              value={deiphobeUserId}
              onChange={(event: React.ChangeEvent<any>) => {
                setDeiphobeUserId(event.target.value);
                updateConfig("deiphobe_user_id", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("Session ID")}>
            <TextInput
              value={deiphobeSessionId}
              onChange={(event: React.ChangeEvent<any>) => {
                setDeiphobeSessionId(event.target.value);
                updateConfig("deiphobe_session_id", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("Namespace")}>
            <TextInput
              value={deiphobeNamespace}
              onChange={(event: React.ChangeEvent<any>) => {
                setDeiphobeNamespace(event.target.value);
                updateConfig("deiphobe_namespace", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("Timeout Seconds")}>
            <TextInput
              value={deiphobeTimeoutSeconds}
              onChange={(event: React.ChangeEvent<any>) => {
                setDeiphobeTimeoutSeconds(event.target.value);
                updateConfig("deiphobe_timeout_seconds", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("Private Mode")}>
            <TextInput
              value={deiphobePrivateMode}
              onChange={(event: React.ChangeEvent<any>) => {
                setDeiphobePrivateMode(event.target.value);
                updateConfig("deiphobe_private_mode", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("Private Memory Root")}>
            <TextInput
              value={deiphobePrivateMemoryRoot}
              onChange={(event: React.ChangeEvent<any>) => {
                setDeiphobePrivateMemoryRoot(event.target.value);
                updateConfig("deiphobe_private_memory_root", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
      </ul>
      <PrivateMemoryPanel
        privateModeSetting={deiphobePrivateMode}
        privateMemoryRootSetting={deiphobePrivateMemoryRoot}
      />
    </BasicPage>
  );
}
