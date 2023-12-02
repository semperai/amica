import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, ResetToDefaultButton } from './common';
import { TextInput } from '@/components/textInput';
import { updateConfig, defaultConfig } from "@/utils/config";

export function NamePage({
  name,
  setName,
  setSettingsUpdated,
}: {
  name: string;
  setName: (name: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <BasicPage
      title={t("Name")}
      description={t("cfg_avatar_name_desc", "Configure the avatars name. This is the name that is used to generate the chatbot response.")}
    >
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label={t("Name")}>
            <TextInput
              value={name}
              onChange={(event: React.ChangeEvent<any>) => {
                setName(event.target.value);
                updateConfig("name", event.target.value);
                setSettingsUpdated(true);
              }}
            />

            { name !== defaultConfig("name") && (
              <p className="mt-2">
                <ResetToDefaultButton onClick={() => {
                  setName(defaultConfig("name"));
                  updateConfig("name", defaultConfig("name"));
                  setSettingsUpdated(true);
                  }}
                />
              </p>
            )}
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
