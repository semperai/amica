import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, NotUsingAlert } from './common';
import { TextInput } from '@/components/textInput';
import { SecretTextInput } from '@/components/secretTextInput';
import { config, updateConfig } from "@/utils/config";


export function ArbiusLLMSettingsPage({
  arbiusLLMModelId,
  setArbiusLLMModelId,
  setSettingsUpdated,
}: {
  arbiusLLMModelId: string;
  setArbiusLLMModelId: (key: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <BasicPage
      title={t("Arbius Settings")}
      description={t('ArbiusLLMSettings_desc', 'Configure the settings for the Arbius LLM chatbot backend.')}
    >
      { config("chatbot_backend") !== "arbius_llm" && (
        <NotUsingAlert>
          You are not currently using Arbius as your ChatBot backend. These settings will not be used.
        </NotUsingAlert>
      ) }
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label="Arbius Model">
            <TextInput
              value={arbiusLLMModelId}
              onChange={(event: React.ChangeEvent<any>) => {
                setArbiusLLMModelId(event.target.value);
                updateConfig("arbius_llm_model_id", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
