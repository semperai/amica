import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, ResetToDefaultButton } from "./common";
import { updateConfig, defaultConfig } from "@/utils/config";
import { TextInput } from "@/components/textInput";

export function BackgroundVideoPage({
  youtubeVideoID,
  setYoutubeVideoID,
  setSettingsUpdated,
}: {
  youtubeVideoID: string;
  setYoutubeVideoID: (id: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const { t } = useTranslation();
  const [videoChanged, setVideoChanged] = useState(false);

  const description = <>{t('bg_youtube_desc', `Select a background video. Copy this from youtube embed, it will look something like <code>kDCXBwzSI-4</code>`)}</>;

  return (
    <BasicPage
      title={t("Background Video")}
      description={description}
    >
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label={t("YouTube Video ID")}>
            <TextInput
              value={youtubeVideoID}
              onChange={(event: React.ChangeEvent<any>) => {
                const id = event.target.value.trim();
                setYoutubeVideoID(id);
                updateConfig("youtube_videoid", id);
                setSettingsUpdated(true);
                setVideoChanged(true);
                return false;
              }}
            />
            { youtubeVideoID !== defaultConfig("youtube_videoid") && (
              <p className="mt-2">
                <ResetToDefaultButton onClick={() => {
                  setYoutubeVideoID(defaultConfig("youtube_videoid"));
                  updateConfig("youtube_videoid", defaultConfig("youtube_videoid"));
                  setVideoChanged(true);
                  setSettingsUpdated(true);
                  }}
                />
              </p>
            )}

            { videoChanged && (
              <p className="text-xs text-gray-500 mt-4">
                Video changed. <span className="text-cyan-500 hover:text-cyan-600 hover:cursor-pointer" onClick={() => window.location.reload()}>Refresh</span> to apply.
              </p>
            )}
           </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
