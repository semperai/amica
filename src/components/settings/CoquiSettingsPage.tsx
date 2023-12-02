import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, NotUsingAlert } from './common';
import { TextInput } from "@/components/textInput";
import { SecretTextInput } from "@/components/secretTextInput";
import { config, updateConfig } from "@/utils/config";

export function CoquiSettingsPage({
  coquiApiKey,
  setCoquiApiKey,
  coquiVoiceId,
  setCoquiVoiceId,
  setSettingsUpdated,
}: {
  coquiApiKey: string;
  setCoquiApiKey: (key: string) => void;
  coquiVoiceId: string;
  setCoquiVoiceId: (id: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <BasicPage
      title={t("Coqui") + " "+ t("Settings")}
      description={t("coqui_desc", "Configure Coqui")}
    >
      { config("tts_backend") !== "coqui" && (
        <NotUsingAlert>
          {t("not_using_alert", "You are not currently using {{name}} as your {{what}} backend. These settings will not be used.", {name: t("Coqui"), what: t("TTS")})}
        </NotUsingAlert>
      ) }
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label={t("API Key")}>
            <SecretTextInput
              value={coquiApiKey}
              onChange={(event: React.ChangeEvent<any>) => {
                event.preventDefault();
                setCoquiApiKey(event.target.value);
                updateConfig("coqui_apikey", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("Voice ID")}>
            <TextInput
              value={coquiVoiceId}
              onChange={(event: React.ChangeEvent<any>) => {
                event.preventDefault();
                setCoquiVoiceId(event.target.value);
                updateConfig("coqui_voice_id", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
