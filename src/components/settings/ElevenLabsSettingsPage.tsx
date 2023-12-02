import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, NotUsingAlert } from './common';
import { TextInput } from "@/components/textInput";
import { SecretTextInput } from "@/components/secretTextInput";
import { config, updateConfig } from "@/utils/config";

export function ElevenLabsSettingsPage({
  elevenlabsApiKey,
  setElevenlabsApiKey,
  elevenlabsVoiceId,
  setElevenlabsVoiceId,
  setSettingsUpdated,
}: {
  elevenlabsApiKey: string;
  setElevenlabsApiKey: (key: string) => void;
  elevenlabsVoiceId: string;
  setElevenlabsVoiceId: (id: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <BasicPage
      title={t("ElevenLabs") + " "+ t("Settings")}
      description={t("elevenLabs_desc", "Configure ElevenLabs")}
    >
      { config("tts_backend") !== "elevenlabs" && (
        <NotUsingAlert>
          {t("not_using_alert", "You are not currently using {{name}} as your {{what}} backend. These settings will not be used.", {name: t("ElevenLabs"), what: t("TTS")})}
        </NotUsingAlert>
      ) }
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label={t("API Key")}>
            <SecretTextInput
              value={elevenlabsApiKey}
              onChange={(event: React.ChangeEvent<any>) => {
                setElevenlabsApiKey(event.target.value);
                updateConfig("elevenlabs_apikey", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("Voice ID")}>
            <TextInput
              value={elevenlabsVoiceId}
              onChange={(event: React.ChangeEvent<any>) => {
                setElevenlabsVoiceId(event.target.value);
                updateConfig("elevenlabs_voiceid", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
