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
  const coquiLocalVoiceIdList = ["p225", "p226", "p227", "p228", "p229", "p230", "p231", "p232", "p233", "p234", "p236", "p237", "p238", "p239", "p240", "p241", "p243", "p244", "p245", "p246", "p247", "p248", "p249", "p250", "p251", "p252", "p253", "p254", "p255", "p256", "p257", "p258", "p259", "p260", "p261", "p262", "p263", "p264", "p265", "p266", "p267", "p268", "p269", "p270", "p271", "p272", "p273", "p274", "p275", "p276", "p277", "p278", "p279", "p280", "p281", "p282", "p283", "p284", "p285", "p286", "p287", "p288", "p292", "p293", "p294", "p295", "p297", "p298", "p299", "p300", "p301", "p302", "p303", "p304", "p305", "p306", "p307", "p308", "p310", "p311", "p312", "p313", "p314", "p316", "p317", "p318", "p323", "p326", "p329", "p330", "p333", "p334", "p335", "p336", "p339", "p340", "p341", "p343", "p345", "p347", "p351", "p360", "p361", "p362", "p363", "p364", "p374", "p376"];

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
            <select
              value={coquiLocalVoiceId}
              onChange={(event: React.ChangeEvent<any>) => {
                event.preventDefault();
                setCoquiLocalVoiceId(event.target.value);
                updateConfig("coquiLocal_voiceid", event.target.value);
                setSettingsUpdated(true);
              }}
            >
              {coquiLocalVoiceIdList.map((voiceId) =>
                <option
                  key={voiceId}
                  value={voiceId}
                >
                  {voiceId}
                </option>
              )}
            </select>
          </FormRow>
        </li>
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}