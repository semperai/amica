import { BasicPage, FormRow, basename } from './common';
import { TextInput } from "@/components/textInput";
import { SecretTextInput } from "@/components/secretTextInput";
import { updateConfig } from "@/utils/config";
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
  return (
    <BasicPage
      title="SpeechT5 Settings"
      description="Configure SpeechT5"
    >
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
