import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, NotUsingAlert } from './common';
import { TextInput } from "@/components/textInput";
import { config, updateConfig } from "@/utils/config";

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
      </ul>
    </BasicPage>
  );
}
