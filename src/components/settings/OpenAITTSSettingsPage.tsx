import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, NotUsingAlert } from './common';
import { TextInput } from "@/components/textInput";
import { SecretTextInput } from "@/components/secretTextInput";
import { config, updateConfig } from "@/utils/config";

export function OpenAITTSSettingsPage({
  openAITTSApiKey,
  setOpenAITTSApiKey,
  openAITTSUrl,
  setOpenAITTSUrl,
  openAITTSModel,
  setOpenAITTSModel,
  openAITTSVoice,
  setOpenAITTSVoice,
  setSettingsUpdated,
}: {
  openAITTSApiKey: string;
  setOpenAITTSApiKey: (key: string) => void;
  openAITTSUrl: string;
  setOpenAITTSUrl: (url: string) => void;
  openAITTSModel: string;
  setOpenAITTSModel: (model: string) => void;
  openAITTSVoice: string;
  setOpenAITTSVoice: (voice: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <BasicPage
      title={t("OpenAI TTS") + " "+ t("Settings")}
      description={t("OpenAI_tts_desc", "Configure OpenAI TTS")}
    >
      { config("tts_backend") !== "openai_tts" && (
        <NotUsingAlert>
          {t("not_using_alert", "You are not currently using {{name}} as your {{what}} backend. These settings will not be used.", {name: t("OpenAI"), what: t("TTS")})}
        </NotUsingAlert>
      ) }
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label={t("API Key")}>
            <SecretTextInput
              value={openAITTSApiKey}
              onChange={(event: React.ChangeEvent<any>) => {
                event.preventDefault();
                setOpenAITTSApiKey(event.target.value);
                updateConfig("openai_tts_apikey", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("API URL")}>
            <TextInput
              value={openAITTSUrl}
              onChange={(event: React.ChangeEvent<any>) => {
                event.preventDefault();
                setOpenAITTSUrl(event.target.value);
                updateConfig("openai_tts_url", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("Model")}>
            <TextInput
              value={openAITTSModel}
              onChange={(event: React.ChangeEvent<any>) => {
                event.preventDefault();
                setOpenAITTSModel(event.target.value);
                updateConfig("openai_tts_model", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("Voice")}>
            <TextInput
              value={openAITTSVoice}
              onChange={(event: React.ChangeEvent<any>) => {
                event.preventDefault();
                setOpenAITTSVoice(event.target.value);
                updateConfig("openai_tts_voice", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
