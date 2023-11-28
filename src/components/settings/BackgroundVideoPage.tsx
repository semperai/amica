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
  const description = <>Select a background video. Copy this from youtube embed, it will look something like <code>kDCXBwzSI-4</code></>;

  return (
    <BasicPage
      title="Background Video"
      description={description}
    >
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label="YouTube Video ID">
            <TextInput
              value={youtubeVideoID}
              onChange={(event: React.ChangeEvent<any>) => {
                const id = event.target.value.trim();
                setYoutubeVideoID(id);
                updateConfig("youtube_videoid", id);
                setSettingsUpdated(true);
                return false;
              }}
            />
            { youtubeVideoID !== defaultConfig("youtube_videoid") && (
              <p className="mt-2">
                <ResetToDefaultButton onClick={() => {
                  setYoutubeVideoID(defaultConfig("youtube_videoid"));
                  updateConfig("youtube_videoid", defaultConfig("youtube_videoid"));
                  setSettingsUpdated(true);
                  }}
                />
              </p>
            )}
           </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
