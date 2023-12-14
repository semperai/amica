import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, NotUsingAlert } from "./common";
import { TextInput } from "@/components/textInput";
import { config, updateConfig } from "@/utils/config";

export function VisionOllamaSettingsPage({
  visionOllamaUrl,
  setVisionOllamaUrl,
  visionOllamaModel,
  setVisionOllamaModel,
  setSettingsUpdated,
}: {
  visionOllamaUrl: string;
  setVisionOllamaUrl: (url: string) => void;
  visionOllamaModel: string;
  setVisionOllamaModel: (url: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const { t } = useTranslation();

  const description = <>{t("ollama_desc", "Ollama lets you get up and running with large language models locally. Download from")} <a href="https://ollama.ai/">{t("ollama.ai")}</a></>;

  return (
    <BasicPage
      title={t("Ollama") + " " + t("Settings")}
      description={description}
    >
      { config("vision_backend") !== "vision_ollama" && (
        <NotUsingAlert>
          {t("not_using_alert", "You are not currently using {{name}} as your {{what}} backend. These settings will not be used.", {name: t("Ollama"), what: t("Vision")})}
        </NotUsingAlert>
      ) }
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label={t("API URL")}>
            <TextInput
              value={visionOllamaUrl}
              onChange={(event: React.ChangeEvent<any>) => {
                setVisionOllamaUrl(event.target.value);
                updateConfig("vision_ollama_url", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("Model")}>
            <TextInput
              value={visionOllamaModel}
              onChange={(event: React.ChangeEvent<any>) => {
                setVisionOllamaModel(event.target.value);
                updateConfig("vision_ollama_model", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
