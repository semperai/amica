import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, NotUsingAlert } from "./common";
import { TextInput } from "@/components/textInput";
import { SecretTextInput } from "@/components/secretTextInput";
import { config, updateConfig } from "@/utils/config";

export function VisionOpenAISettingsPage({
  visionOpenAIApiKey,
  setVisionOpenAIApiKey,
  visionOpenAIUrl,
  setVisionOpenAIUrl,
  visionOpenAIModel,
  setVisionOpenAIModel,
  setSettingsUpdated,
}: {
  visionOpenAIApiKey: string;
  setVisionOpenAIApiKey: (url: string) => void;
  visionOpenAIUrl: string;
  setVisionOpenAIUrl: (url: string) => void;
  visionOpenAIModel: string;
  setVisionOpenAIModel: (url: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const { t } = useTranslation();

  const description = <>Configure OpenAI vision settings. You can get an API key from <a href="https://platform.openai.com">platform.openai.com</a>. You can generally use other OpenAI compatible URLs and models here too, provided they have vision support, such as <a href="https://openrouter.ai/">OpenRouter</a> or <a href="https://lmstudio.ai/">LM Studio</a>.</>;

  return (
    <BasicPage
      title={t("OpenAI") + " " + t("Settings")}
      description={description}
    >
      { config("vision_backend") !== "vision_openai" && (
        <NotUsingAlert>
          {t("not_using_alert", "You are not currently using {{name}} as your {{what}} backend. These settings will not be used.", {name: t("OpenAI"), what: t("Vision")})}
        </NotUsingAlert>
      ) }
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label={t("API Key")}>
            <SecretTextInput
              value={visionOpenAIApiKey}
              onChange={(event: React.ChangeEvent<any>) => {
                event.preventDefault();
                setVisionOpenAIApiKey(event.target.value);
                updateConfig("vision_openai_apikey", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("API URL")}>
            <TextInput
              value={visionOpenAIUrl}
              onChange={(event: React.ChangeEvent<any>) => {
                setVisionOpenAIUrl(event.target.value);
                updateConfig("vision_openai_url", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("Model")}>
            <TextInput
              value={visionOpenAIModel}
              onChange={(event: React.ChangeEvent<any>) => {
                setVisionOpenAIModel(event.target.value);
                updateConfig("vision_openai_model", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
