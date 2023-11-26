import { BasicPage, FormRow } from './common';
import { TextInput } from "@/components/textInput";
import { SecretTextInput } from "@/components/secretTextInput";
import { updateConfig } from "@/utils/config";

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
  return (
    <BasicPage
      title="Coqui Settings"
      description="Configure Coqui"
    >
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label="API Key">
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
          <FormRow label="Voice Id">
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