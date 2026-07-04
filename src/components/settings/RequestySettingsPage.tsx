import { BasicPage, FormRow, NotUsingAlert } from './common';
import { TextInput } from '@/components/textInput';
import { SecretTextInput } from '@/components/secretTextInput';
import { config, updateConfig } from "@/utils/config";


export function RequestySettings({
  requestyApiKey,
  setRequestyApiKey,
  requestyUrl,
  setRequestyUrl,
  requestyModel,
  setRequestyModel,
  setSettingsUpdated,
}: {
  requestyApiKey: string;
  setRequestyApiKey: (key: string) => void;
  requestyUrl: string;
  setRequestyUrl: (url: string) => void;
  requestyModel: string;
  setRequestyModel: (model: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const description = <>Configure Requesty settings. You can get an API key from <a href="https://app.requesty.ai/api-keys">https://app.requesty.ai/api-keys</a></>;

  return (
    <BasicPage
      title="Requesty Settings"
      description={description}
    >
      { config("chatbot_backend") !== "requesty" && (
        <NotUsingAlert>
          You are not currently using Requesty as your ChatBot backend. These settings will not be used.
        </NotUsingAlert>
      ) }
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label="Requesty API Key">
            <SecretTextInput
              value={requestyApiKey}
              onChange={(event: React.ChangeEvent<any>) => {
                setRequestyApiKey(event.target.value);
                updateConfig("requesty_apikey", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label="Requesty URL">
            <TextInput
              value={requestyUrl}
              onChange={(event: React.ChangeEvent<any>) => {
                setRequestyUrl(event.target.value);
                updateConfig("requesty_url", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label="Requesty Model">
            <TextInput
              value={requestyModel}
              onChange={(event: React.ChangeEvent<any>) => {
                setRequestyModel(event.target.value);
                updateConfig("requesty_model", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
