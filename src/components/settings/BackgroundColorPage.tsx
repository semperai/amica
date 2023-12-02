import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, ResetToDefaultButton } from './common';
import { TextInput } from '@/components/textInput';
import { updateConfig, defaultConfig } from "@/utils/config";

export function BackgroundColorPage({
  bgColor,
  setBgColor,
  setSettingsUpdated,
}: {
  bgColor: string;
  setBgColor: (color: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <BasicPage
      title={t("Background Color")}
      description={t("bg_color_desc", "Configure the background color. This overrides background image.")}
    >
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          {bgColor === '' && (
            <p className="text-xs text-gray-500">{t("no_bg_color", "No background color set. Click the box below.")}</p>
          )}
          <FormRow label={t("Color")}>
            <input
              className={"block bg-white border-0 outline-none focus:ring-0 focus:border-gray-300 rounded-md shadow-sm w-20"}
              type="color"
              value={bgColor}
              onChange={(event: React.ChangeEvent<any>) => {
              document.body.style.backgroundImage = `none`;
                document.body.style.backgroundColor = event.target.value;
                updateConfig("youtube_videoid", "");
                updateConfig("bg_url", "");
                updateConfig("bg_color", event.target.value);
                setBgColor(event.target.value);
                setSettingsUpdated(true);
              }}
            />

            { bgColor !== defaultConfig("bg_color") && (
              <p className="mt-2">
                <ResetToDefaultButton onClick={() => {
                  setBgColor(defaultConfig("bg_color"));
                  updateConfig("bg_color", defaultConfig("bg_color"));
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
