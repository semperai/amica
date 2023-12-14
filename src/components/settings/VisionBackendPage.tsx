import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, Link, getLinkFromPage } from './common';
import { updateConfig } from "@/utils/config";

const visionEngines = [
  {key: "none",            label: "None"},
  {key: "vision_llamacpp", label: "LLama.cpp"},
  {key: "vision_ollama",   label: "Ollama"},
];

function idToTitle(id: string): string {
  return visionEngines[visionEngines.findIndex((engine) => engine.key === id)].label;
}

export function VisionBackendPage({
  visionBackend,
  setVisionBackend,
  setSettingsUpdated,
  setPage,
  breadcrumbs,
  setBreadcrumbs,
}: {
  visionBackend: string;
  setVisionBackend: (backend: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
  setPage: (page: string) => void;
  breadcrumbs: Link[];
  setBreadcrumbs: (breadcrumbs: Link[]) => void;
}) {
  const { t } = useTranslation();

  return (
    <BasicPage
      title={t("Vision Backend")}
      description={t("Vision_Backend_desc", "Select the Vision backend to use")}
    >
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label={t("Vision Backend")}>
            <select
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={visionBackend}
              onChange={(event: React.ChangeEvent<any>) => {
                setVisionBackend(event.target.value);
                updateConfig("vision_backend", event.target.value);
                setSettingsUpdated(true);
              }}
            >
              {visionEngines.map((engine) => (
                <option key={engine.key} value={engine.key}>{t(engine.label)}</option>
              ))}
            </select>
          </FormRow>
        </li>
        { ["vision_llamacpp", "vision_ollama"].includes(visionBackend) && (
          <li className="py-4">
            <FormRow label={`${t("Configure")} ${t(idToTitle(visionBackend))}`}>
              <button
                type="button"
                className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={() => {
                  setPage(`${visionBackend}_settings`);
                  setBreadcrumbs(breadcrumbs.concat([getLinkFromPage(`${visionBackend}_settings`)]));
                }}
              >
                {t("Click here to configure")} {t(idToTitle(visionBackend))}
              </button>
            </FormRow>
          </li>
        )}
      </ul>
    </BasicPage>
  );
}
