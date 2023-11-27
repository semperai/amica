import { BasicPage, FormRow } from './common';
import { TextInput } from "@/components/textInput";
import { updateConfig } from "@/utils/config";

export function VisionLlamaCppSettingsPage({
  visionLlamaCppUrl,
  setVisionLlamaCppUrl,
  setSettingsUpdated,
}: {
  visionLlamaCppUrl: string;
  setVisionLlamaCppUrl: (url: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const description = <>LLama.cpp is a free and open source chatbot backend. You should build the server from source and run it on your own computer. You can get the source code from <a href="https://github.com/ggerganov/llama.cpp">GitHub</a></>;

  return (
    <BasicPage
      title="Vision LLama.cpp Settings"
      description={description}
    >
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label="API URL">
            <TextInput
              value={visionLlamaCppUrl}
              onChange={(event: React.ChangeEvent<any>) => {
                setVisionLlamaCppUrl(event.target.value);
                updateConfig("vision_llamacpp_url", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
