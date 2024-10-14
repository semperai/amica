import { useTranslation } from 'react-i18next';

import {  BasicPage, FormRow } from './common';
import { IconButton } from "@/components/iconButton";
import { SwitchBox } from '@/components/switchBox';
import { config, updateConfig } from "@/utils/config";

export function DeveloperPage({
  debugGfx,
  setDebugGfx,
  setSettingsUpdated,
}: {
  debugGfx: boolean;
  setDebugGfx: (value: boolean) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <BasicPage
      title={t("Developer")}
      description="Enable debug options for developers."
    >
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label="Debug Rendering (requires restart)">
            <SwitchBox
              value={debugGfx}
              label="Debug Rendering"
              onChange={(value: boolean) => {
                setDebugGfx(value);
                updateConfig("debug_gfx", value.toString());
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
