import { useEffect, useState } from 'react';
import { getWindowAI } from "window.ai";
import { BasicPage, Link, FormRow, getLinkFromPage } from './common';
import { updateConfig } from "@/utils/config";

const chatbotBackends = [
  {key: "echo",       label: "Echo"},
  {key: "chatgpt",    label: "ChatGPT"},
  {key: "llamacpp",   label: "LLama.cpp"},
  {key: "windowai",   label: "Window.ai"},
  {key: "ollama",     label: "Ollama"},
  {key: "koboldai",   label: "KoboldAI"},
];

function idToTitle(id: string): string {
  return chatbotBackends[chatbotBackends.findIndex((engine) => engine.key === id)].label;
}

export function ChatbotBackendPage({
  chatbotBackend,
  setChatbotBackend,
  setSettingsUpdated,
  setPage,
  breadcrumbs,
  setBreadcrumbs,
}: {
  chatbotBackend: string;
  setChatbotBackend: (backend: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
  setPage: (page: string) => void;
  breadcrumbs: Link[];
  setBreadcrumbs: (breadcrumbs: Link[]) => void;
}) {
  const [windowAiDetected, setWindowAiDetected] = useState(false);

  useEffect(() => {
    (async () => {
      const windowAI = await getWindowAI();
      if (windowAI) {
        setWindowAiDetected(true);
      }
    })();
  }, []);

  return (
    <BasicPage
      title="Chatbot Backend"
      description="Select the chatbot backend to use. Echo simply responds with what you type, it is used for testing and demonstration. ChatGPT is a commercial chatbot API from OpenAI, however there are multiple compatible API providers which can be used in lieu of OpenAI. LLama.cpp is a free and open source chatbot backend."
    >
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label="Chatbot Backend">
            <select
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={chatbotBackend}
              onChange={(event: React.ChangeEvent<any>) => {
                setChatbotBackend(event.target.value);
                updateConfig("chatbot_backend", event.target.value);
                setSettingsUpdated(true);
              }}
            >
              {chatbotBackends.map((engine) => (
                <option key={engine.key} value={engine.key}>{engine.label}</option>
              ))}
            </select>
          </FormRow>
        </li>
        { ["chatgpt", "llamacpp", "ollama", "koboldai"].includes(chatbotBackend) && (
          <li className="py-4">
            <FormRow label={`Configure ${idToTitle(chatbotBackend)}`}>
              <button
                type="button"
                className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={() => {
                  setPage(`${chatbotBackend}_settings`);
                  setBreadcrumbs(breadcrumbs.concat([getLinkFromPage(`${chatbotBackend}_settings`)]));
                }}
              >
                Click here to configure {idToTitle(chatbotBackend)}
              </button>
            </FormRow>
          </li>
        )}
        { chatbotBackend === 'windowai' && ! windowAiDetected && (
          <li className="py-4">
            <FormRow label="Window.ai not found">
              <a
                href="https://windowai.io/"
                target="_blank"
                className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Install window.ai
              </a>
            </FormRow>
          </li>
        )} 
      </ul>
    </BasicPage>
  );
}
