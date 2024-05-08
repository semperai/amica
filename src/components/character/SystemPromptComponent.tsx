import { useTranslation } from 'react-i18next';

import { updateConfig, defaultConfig } from "@/utils/config";
import { FormRow, ResetToDefaultButton } from '../settings/common';

export function SystemPromptComponent({
  systemPrompt,
  setSystemPrompt,
  setSettingsUpdated,
}: {
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <FormRow label={t("System Prompt")}>
    <textarea
        value={systemPrompt}
        rows={8}
        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        onChange={(event: React.ChangeEvent<any>) => {
            event.preventDefault();
            setSystemPrompt(event.target.value);
            setSettingsUpdated(true);
        }} />

    { systemPrompt !== defaultConfig("system_prompt") && (
        <p className="mt-2">
        <ResetToDefaultButton onClick={() => {
            setSystemPrompt(defaultConfig("system_prompt"));
            updateConfig("system_prompt", defaultConfig("system_prompt"));
            setSettingsUpdated(true);
            }}
        />
        </p>
    )}
    </FormRow>
  );
}
