import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, basename, NotUsingAlert } from './common';
import { config, updateConfig } from "@/utils/config";
import { speechT5SpeakerEmbeddingsList } from "@/paths";

export function SpeechT5SettingsPage({
  speechT5SpeakerEmbeddingsUrl,
  setSpeechT5SpeakerEmbeddingsUrl,
  setSettingsUpdated,
}: {
  speechT5SpeakerEmbeddingsUrl: string;
  setSpeechT5SpeakerEmbeddingsUrl: (url: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <BasicPage
      title={t("SpeechT5") + " "+ t("Settings")}
      description={t("SpeechT5_desc", "Configure SpeechT5")}
    >
      { config("tts_backend") !== "speecht5" && (
        <NotUsingAlert>
          {t("not_using_alert", "You are not currently using {{name}} as your {{what}} backend. These settings will not be used.", {name: t("SpeechT5"), what: t("TTS")})}
        </NotUsingAlert>
      ) }
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label="Speaker Embeddings URL">
            <select
              value={speechT5SpeakerEmbeddingsUrl}
              onChange={(event: React.ChangeEvent<any>) => {
                event.preventDefault();
                setSpeechT5SpeakerEmbeddingsUrl(event.target.value);
                updateConfig("speecht5_speaker_embedding_url", event.target.value);
                setSettingsUpdated(true);
              }}
            >
              {speechT5SpeakerEmbeddingsList.map((url) =>
                <option
                  key={url}
                  value={url}
                >
                  {basename(url)}
                </option>
              )}
            </select>
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
