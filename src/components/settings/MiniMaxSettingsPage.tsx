import { BasicPage, FormRow, NotUsingAlert } from './common';
import { TextInput } from '@/components/textInput';
import { SecretTextInput } from '@/components/secretTextInput';
import { config, updateConfig } from "@/utils/config";


export function MiniMaxSettingsPage({
  miniMaxApiKey,
  setMiniMaxApiKey,
  miniMaxUrl,
  setMiniMaxUrl,
  miniMaxModel,
  setMiniMaxModel,
  setSettingsUpdated,
}: {
  miniMaxApiKey: string;
  setMiniMaxApiKey: (key: string) => void;
  miniMaxUrl: string;
  setMiniMaxUrl: (url: string) => void;
  miniMaxModel: string;
  setMiniMaxModel: (model: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const description = <>Configure MiniMax settings. You can get an API key from <a href="https://platform.minimaxi.com">https://platform.minimaxi.com</a>. Available models: MiniMax-M2.7, MiniMax-M2.5, MiniMax-M2.5-highspeed.</>;

  return (
    <BasicPage
      title="MiniMax Settings"
      description={description}
    >
      { config("chatbot_backend") !== "minimax" && (
        <NotUsingAlert>
          You are not currently using MiniMax as your ChatBot backend. These settings will not be used.
        </NotUsingAlert>
      ) }
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label="MiniMax API Key">
            <SecretTextInput
              value={miniMaxApiKey}
              onChange={(event: React.ChangeEvent<any>) => {
                setMiniMaxApiKey(event.target.value);
                updateConfig("minimax_apikey", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label="MiniMax URL">
            <TextInput
              value={miniMaxUrl}
              onChange={(event: React.ChangeEvent<any>) => {
                setMiniMaxUrl(event.target.value);
                updateConfig("minimax_url", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label="MiniMax Model">
            <select
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={miniMaxModel}
              onChange={(event: React.ChangeEvent<any>) => {
                setMiniMaxModel(event.target.value);
                updateConfig("minimax_model", event.target.value);
                setSettingsUpdated(true);
              }}
            >
              <option value="MiniMax-M2.7">MiniMax-M2.7</option>
              <option value="MiniMax-M2.5">MiniMax-M2.5</option>
              <option value="MiniMax-M2.5-highspeed">MiniMax-M2.5-highspeed</option>
            </select>
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
