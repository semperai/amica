import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, NotUsingAlert } from './common';
import { TextInput } from "@/components/textInput";
import { SecretTextInput } from "@/components/secretTextInput";
import { config, updateConfig } from "@/utils/config";

export function WhisperOpenAISettingsPage({
  whisperOpenAIUrl,
  setWhisperOpenAIUrl,
  whisperOpenAIApiKey,
  setWhisperOpenAIApiKey,
  whisperOpenAIModel,
  setWhisperOpenAIModel,
  setSettingsUpdated,
}: {
  whisperOpenAIUrl: string;
  setWhisperOpenAIUrl: (key: string) => void;
  whisperOpenAIApiKey: string;
  setWhisperOpenAIApiKey: (key: string) => void;
  whisperOpenAIModel: string;
  setWhisperOpenAIModel: (model: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <BasicPage
      title={t("Whisper (OpenAI)") + " "+ t("Settings")}
      description={t("Whisper_OpenAI_desc", "Configure Whisper (OpenAI)")}
    >
      { config("stt_backend") !== "whisper_openai" && (
        <NotUsingAlert>
          {t("not_using_alert", "You are not currently using {{name}} as your {{what}} backend. These settings will not be used.", {name: t("Whisper (OpenAI)"), what: t("STT")})}
        </NotUsingAlert>
      ) }
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label={t("OpenAI URL")}>
            <TextInput
              value={whisperOpenAIUrl}
              onChange={(event: React.ChangeEvent<any>) => {
                setWhisperOpenAIUrl(event.target.value);
                updateConfig("openai_whisper_url", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("API Key")}>
            <SecretTextInput
              value={whisperOpenAIApiKey}
              onChange={(event: React.ChangeEvent<any>) => {
                setWhisperOpenAIApiKey(event.target.value);
                updateConfig("openai_whisper_apikey", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("Model")}>
            <TextInput
              value={whisperOpenAIModel}
              onChange={(event: React.ChangeEvent<any>) => {
                setWhisperOpenAIModel(event.target.value);
                updateConfig("openai_whisper_model", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
