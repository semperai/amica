import { BasicPage, FormRow } from './common';
import { updateConfig } from "@/utils/config";

export function SystemPromptPage({
  systemPrompt,
  setSystemPrompt,
  setSettingsUpdated,
}: {
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  return (
    <BasicPage
      title="System Prompt"
      description="Configure the system prompt. This is the prompt that is used to generate the chatbot response."
    >
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label="System Prompt">
            <textarea
              value={systemPrompt}
              rows={8}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              onChange={(event: React.ChangeEvent<any>) => {
                event.preventDefault();
                setSystemPrompt(event.target.value);
                updateConfig("system_prompt", event.target.value);
                setSettingsUpdated(true);
              }}></textarea>
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
