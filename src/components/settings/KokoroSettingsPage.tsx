import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BasicPage, FormRow, NotUsingAlert } from './common';
import { TextInput } from "@/components/textInput";
import { config, updateConfig } from "@/utils/config";
import { kokoroVoiceList } from '@/features/kokoro/kokoro';

export function KokoroSettingsPage({
  kokoroUrl,
  kokoroVoice,
  setKokoroUrl,
  setKokoroVoice,
  setSettingsUpdated,
}: {
  kokoroUrl: string;
  kokoroVoice: string;
  setKokoroUrl: (key: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
  setKokoroVoice: (key: string) => void;
}) {
  const { t } = useTranslation();
  const [voiceList, setVoiceList] = useState<{ key: string; label: string }[]>([]);

  useEffect(() => {
    async function fetchVoiceList() {
      try {
        const data = await kokoroVoiceList();
        if (data && data.voices) {
          const formattedVoices = data.voices.map((voice: string) => ({
            key: voice,
            label: voice,
          }));
          setVoiceList(formattedVoices);
        }
      } catch (error) {
        console.error("Error fetching kokoro voice list:", error);
      }
    }
    fetchVoiceList();
  }, []);

  return (
    <BasicPage
      title={t("Kokoro") + " "+ t("Settings")}
      description={t("kokoro_desc", "Configure Kokoro")}
    >
      { config("tts_backend") !== "kokoro" && (
        <NotUsingAlert>
          {t("not_using_alert", "You are not currently using {{name}} as your {{what}} backend. These settings will not be used.", {name: t("Kokoro"), what: t("TTS")})}
        </NotUsingAlert>
      ) }
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label={t("URL")}>
            <TextInput
              value={kokoroUrl}
              onChange={(event: React.ChangeEvent<any>) => {
                setKokoroUrl(event.target.value);
                updateConfig("kokoro_url", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("Voices")}>
            <select
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={kokoroVoice}
              onChange={(event: React.ChangeEvent<any>) => {
                event.preventDefault();
                setKokoroVoice(event.target.value);
                updateConfig("kokoro_voice", event.target.value);
                setSettingsUpdated(true);
              }}
            >
              {voiceList.map((voice) => (
                <option key={voice.key} value={voice.key}>{t(voice.label)}</option>
              ))}
            </select>
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
