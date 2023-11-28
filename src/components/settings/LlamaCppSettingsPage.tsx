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
  const description = <>LLama.cpp is a free and open source chatbot backend. You should build the server from source and run it on your own computer. You can get the source code from <a href="https://github.com/ggerganov/llama.cpp">GitHub</a></>;

  return (
    <BasicPage
      title="LLama.cpp Settings"
      description={description}
    >
      { config("chatbot_backend") !== "llamacpp" && (
        <NotUsingAlert>
          You are not currently using llama.cpp as your ChatBot backend. These settings will not be used.
        </NotUsingAlert>
      ) }
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label="API URL">
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
