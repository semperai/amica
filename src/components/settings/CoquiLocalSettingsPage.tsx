import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, NotUsingAlert } from './common';
import { TextInput } from "@/components/textInput";
import { config, updateConfig } from "@/utils/config";

export function CoquiLocalSettingsPage({
  coquiLocalUrl,
  setCoquiLocalUrl,
  setSettingsUpdated,
  coquiLocalVoiceId,
  setCoquiLocalVoiceId
}: {
  coquiLocalUrl: string;
  coquiLocalVoiceId: string;
  setCoquiLocalUrl: (key: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
  setCoquiLocalVoiceId: (key: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <BasicPage
      title={t("CoquiLocal") + " "+ t("Settings")}
      description={t("coquiLocal_desc", "Configure CoquiLocal")}
    >
      { config("tts_backend") !== "coquiLocal" && (
        <NotUsingAlert>
          {t("not_using_alert", "You are not currently using {{name}} as your {{what}} backend. These settings will not be used.", {name: t("CoquiLocal"), what: t("TTS")})}
        </NotUsingAlert>
      ) }
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label={t("URL")}>
            <TextInput
              value={coquiLocalUrl}
              onChange={(event: React.ChangeEvent<any>) => {
                setCoquiLocalUrl(event.target.value);
                updateConfig("coquiLocal_url", event.target.value);
                setSettingsUpdated(true);
              }}
            />
            <li className="py-4">
          <FormRow label={t("Voice ID")}>
            <TextInput
              value={coquiLocalVoiceId}
              onChange={(event: React.ChangeEvent<any>) => {
                event.preventDefault();
                setCoquiLocalVoiceId(event.target.value);
                updateConfig("coquiLocal_voiceid", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}