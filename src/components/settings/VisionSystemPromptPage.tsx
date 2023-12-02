import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, ResetToDefaultButton } from './common';
import { updateConfig, defaultConfig } from "@/utils/config";

export function VisionSystemPromptPage({
  visionSystemPrompt,
  setVisionSystemPrompt,
  setSettingsUpdated,
}: {
  visionSystemPrompt: string;
  setVisionSystemPrompt: (prompt: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <BasicPage
      title={t("Vision") + " " + t("System Prompt") + " "+ t("Settings")}
      description={t("Vision_System_Prompt_desc", "Configure the vision system prompt. This is the prompt that is used to generate the image descriptions.")}
    >
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label={t("Vision") + " " + t("System Prompt")}>
            <textarea
              value={visionSystemPrompt}
              rows={8}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              onChange={(event: React.ChangeEvent<any>) => {
                event.preventDefault();
                setVisionSystemPrompt(event.target.value);
                updateConfig("vision_system_prompt", event.target.value);
                setSettingsUpdated(true);
              }}
            />

            { visionSystemPrompt !== defaultConfig("vision_system_prompt") && (
              <p className="mt-2">
                <ResetToDefaultButton onClick={() => {
                  setVisionSystemPrompt(defaultConfig("vision_system_prompt"));
                  updateConfig("vision_system_prompt", defaultConfig("vision_system_prompt"));
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
