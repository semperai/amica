import { BasicPage, FormRow } from './common';
import { TextInput } from "@/components/textInput";
import { updateConfig } from "@/utils/config";

export function VisionSystemPromptPage({
  visionSystemPrompt,
  setVisionSystemPrompt,
  setSettingsUpdated,
}: {
  visionSystemPrompt: string;
  setVisionSystemPrompt: (prompt: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  return (
    <BasicPage
      title="Vision System Prompt"
      description="Configure the vision system prompt. This is the prompt that is used to generate the image descriptions."
    >
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label="Vision System Prompt">
            <textarea
              value={visionSystemPrompt}
              rows={8}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              onChange={(event: React.ChangeEvent<any>) => {
                event.preventDefault();
                setVisionSystemPrompt(event.target.value);
                updateConfig("vision_system_prompt", event.target.value);
                setSettingsUpdated(true);
              }}></textarea>
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
