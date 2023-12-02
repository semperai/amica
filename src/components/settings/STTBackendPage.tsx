import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, getLinkFromPage, Link } from './common';
import { updateConfig } from "@/utils/config";

const sttEngines = [
  {key: "none",            label: "None"},
  {key: "whisper_browser", label: "Whisper (Browser)"},
  {key: "whisper_openai",  label: "Whisper (OpenAI)"},
  {key: "whispercpp",      label: "Whisper.cpp"},
];

function idToTitle(id: string): string {
  return sttEngines[sttEngines.findIndex((engine) => engine.key === id)].label;
}

export function STTBackendPage({
  sttBackend,
  setSTTBackend,
  setSettingsUpdated,
  setPage,
  breadcrumbs,
  setBreadcrumbs,
}: {
  sttBackend: string;
  setSTTBackend: (backend: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
  setPage: (page: string) => void;
  breadcrumbs: Link[];
  setBreadcrumbs: (breadcrumbs: Link[]) => void;
}) {
  const { t } = useTranslation();

  return (
    <BasicPage
      title={t("STT") + " "+ t("Settings")}
      description={t("STT_desc", "Select the STT backend to use")}
    >
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label={t("STT Backend")}>
            <select
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={sttBackend}
              onChange={(event: React.ChangeEvent<any>) => {
                setSTTBackend(event.target.value);
                updateConfig("stt_backend", event.target.value);
                setSettingsUpdated(true);
              }}
            >
              {sttEngines.map((engine) => (
                <option key={engine.key} value={engine.key}>{engine.label}</option>
              ))}
            </select>
          </FormRow>
        </li>
        { ["whisper_openai", "whispercpp"].includes(sttBackend) && (
          <li className="py-4">
            <FormRow label={`${t("Configure")} ${t(idToTitle(sttBackend))}`}>
              <button
                type="button"
                className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={() => {
                  setPage(`${sttBackend}_settings`);
                  setBreadcrumbs(breadcrumbs.concat([getLinkFromPage(`${sttBackend}_settings`)]));
                }}
              >
                {t("Click here to configure")} {t(idToTitle(sttBackend))}
              </button>
            </FormRow>
          </li>
        )}
      </ul>
    </BasicPage>
  );
}
