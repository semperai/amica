import { BasicPage, FormRow } from './common';
import { TextInput } from "@/components/textInput";
import { SecretTextInput } from "@/components/secretTextInput";
import { updateConfig } from "@/utils/config";

export function WhisperOpenAISettingsPage({
  whisperOpenAIUrl,
  setWhisperOpenAIUrl,
  whisperOpenAIApiKey,
  setWhisperOpenAIApiKey,
  whisperOpenAIModel,
  setWhisperOpenAIModel,
  setSettingsUpdated,
}: {
  whisperOpenAIUrl: string;
  setWhisperOpenAIUrl: (key: string) => void;
  whisperOpenAIApiKey: string;
  setWhisperOpenAIApiKey: (key: string) => void;
  whisperOpenAIModel: string;
  setWhisperOpenAIModel: (model: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  return (
    <BasicPage
      title="Whisper (OpenAI) Settings"
      description="Configure Whisper (OpenAI)"
    >
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label="OpenAI URL">
            <TextInput
              value={whisperOpenAIUrl}
              onChange={(event: React.ChangeEvent<any>) => {
                setWhisperOpenAIUrl(event.target.value);
                updateConfig("openai_whisper_url", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label="API Key">
            <SecretTextInput
              value={whisperOpenAIApiKey}
              onChange={(event: React.ChangeEvent<any>) => {
                setWhisperOpenAIApiKey(event.target.value);
                updateConfig("openai_whisper_apikey", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label="Model">
            <TextInput
              value={whisperOpenAIModel}
              onChange={(event: React.ChangeEvent<any>) => {
                setWhisperOpenAIModel(event.target.value);
                updateConfig("openai_whisper_model", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
