import { BasicPage, FormRow, NotUsingAlert } from './common';
import { TextInput } from '@/components/textInput';
import { SecretTextInput } from '@/components/secretTextInput';
import { config, updateConfig } from "@/utils/config";


export function OpenRouterSettings({
  openRouterApiKey,
  setOpenRouterApiKey,
  openRouterUrl,
  setOpenRouterUrl,
  openRouterModel,
  setOpenRouterModel,
  setSettingsUpdated,
}: {
  openRouterApiKey: string;
  setOpenRouterApiKey: (key: string) => void;
  openRouterUrl: string;
  setOpenRouterUrl: (url: string) => void;
  openRouterModel: string;
  setOpenRouterModel: (model: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const description = <>Configure OpenRouter settings. You can get an API key from <a href="https://openrouter.ai">https://openrouter.ai</a></>;

  return (
    <BasicPage
      title="OpenRouter Settings"
      description={description}
    >
      { config("chatbot_backend") !== "openrouter" && (
        <NotUsingAlert>
          You are not currently using OpenRouter as your ChatBot backend. These settings will not be used.
        </NotUsingAlert>
      ) }
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label="OpenRouter API Key">
            <SecretTextInput
              value={openRouterApiKey}
              onChange={(event: React.ChangeEvent<any>) => {
                setOpenRouterApiKey(event.target.value);
                updateConfig("openrouter_apikey", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label="OpenRouter URL">
            <TextInput
              value={openRouterUrl}
              onChange={(event: React.ChangeEvent<any>) => {
                setOpenRouterUrl(event.target.value);
                updateConfig("openrouter_url", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label="OpenRouter Model">
            <TextInput
              value={openRouterModel}
              onChange={(event: React.ChangeEvent<any>) => {
                setOpenRouterModel(event.target.value);
                updateConfig("openrouter_model", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
