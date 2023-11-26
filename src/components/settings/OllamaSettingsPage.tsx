import { BasicPage, FormRow } from "./common";
import { TextInput } from "@/components/textInput";
import { updateConfig } from "@/utils/config";

export function OllamaSettingsPage({
  ollamaUrl,
  setOllamaUrl,
  ollamaModel,
  setOllamaModel,
  setSettingsUpdated,
}: {
  ollamaUrl: string;
  setOllamaUrl: (url: string) => void;
  ollamaModel: string;
  setOllamaModel: (url: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const description = <>Ollama lets you get up and running with large language models locally. Download from <a href="https://ollama.ai/">ollama.ai</a></>;

  return (
    <BasicPage
      title="Ollama Settings"
      description={description}
    >
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label="API URL">
            <TextInput
              value={ollamaUrl}
              onChange={(event: React.ChangeEvent<any>) => {
                setOllamaUrl(event.target.value);
                updateConfig("ollama_url", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label="Model">
            <TextInput
              value={ollamaModel}
              onChange={(event: React.ChangeEvent<any>) => {
                setOllamaModel(event.target.value);
                updateConfig("ollama_model", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
