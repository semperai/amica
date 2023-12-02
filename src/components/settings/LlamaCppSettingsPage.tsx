import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, NotUsingAlert } from "./common";
import { TextInput } from "@/components/textInput";
import { config, updateConfig } from "@/utils/config";

export function LlamaCppSettingsPage({
  llamaCppUrl,
  setLlamaCppUrl,
  setSettingsUpdated,
}: {
  llamaCppUrl: string;
  setLlamaCppUrl: (url: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const { t } = useTranslation();

  const description = <>{t("llama_cpp_desc", "LLama.cpp is a free and open source chatbot backend. You should build the server from source and run it on your own computer. You can get the source code from")} <a href="https://github.com/ggerganov/llama.cpp">{t("GitHub")}</a></>;

  return (
    <BasicPage
      title={t("LLama.cpp") + " "+ t("Settings")}
      description={description}
    >
      { config("chatbot_backend") !== "llamacpp" && (
        <NotUsingAlert>
          {t("not_using_alert", "You are not currently using {{name}} as your {{what}} backend. These settings will not be used.", {name: t("llama.cpp"), what: t("ChatBot")})}
        </NotUsingAlert>
      ) }
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label={t("API URL")}>
            <TextInput
              value={llamaCppUrl}
              onChange={(event: React.ChangeEvent<any>) => {
                setLlamaCppUrl(event.target.value);
                updateConfig("llamacpp_url", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
