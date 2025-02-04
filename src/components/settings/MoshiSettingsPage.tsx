import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, NotUsingAlert } from "./common";
import { TextInput } from "@/components/textInput";
import { config, updateConfig } from "@/utils/config";

export function MoshiSettingsPage({
  moshiUrl,
  setMoshiUrl,
  setSettingsUpdated,
}: {
  moshiUrl: string;
  setMoshiUrl: (url: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const { t } = useTranslation();

  const description = <>{t("moshi_desc", "Moshi is a speech-text foundation model and full-duplex spoken dialogue framework.")} <a href="https://kyutai.org/">{t("kyutai")}</a></>;

  return (
    <BasicPage
      title={t("Moshi") + " " + t("Settings")}
      description={description}
    >
      { config("chatbot_backend") !== "moshi" && (
        <NotUsingAlert>
          {t("not_using_alert", "You are not currently using {{name}} as your {{what}} backend. These settings will not be used.", {name: t("Moshi"), what: t("ChatBot")})}
        </NotUsingAlert>
      ) }
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label={t("API URL")}>
            <TextInput
              value={moshiUrl}
              onChange={(event: React.ChangeEvent<any>) => {
                setMoshiUrl(event.target.value);
                updateConfig("moshi_url", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
