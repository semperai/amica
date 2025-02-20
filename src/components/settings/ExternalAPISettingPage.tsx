import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow } from './common';
import { config, updateConfig } from "@/utils/config";
import { SwitchBox } from "@/components/switchBox"
import isDev from '@/utils/isDev';


export function ExternalAPIPage({
    externalAPIEnabled,
    setExternalAPIEnabled,
    setSettingsUpdated,
}: {
    externalAPIEnabled: boolean;
    setExternalAPIEnabled: (amicaLifeEnabled: boolean) => void;
    setSettingsUpdated: (updated: boolean) => void;
}) {

    const { t } = useTranslation();

    return (
        <BasicPage
            title={`${t("External API")} ${t("Settings")}`}
            description={`${t("Enables")} ${t("Only in development mode")}`}
        >
            <ul role="list" className="divide-y divide-gray-100 max-w-xs">
                <li className="py-4">
                    <FormRow label={`${t("Use")} ${t("External API")}`}>
                        <SwitchBox
                            value={externalAPIEnabled}
                            label={`${t("External API")} ${t("Enabled")} ${t("(Disable to improve performance)")}`}
                            disabled={!isDev}
                            onChange={(value: boolean) => {
                                setExternalAPIEnabled(value);
                                updateConfig("external_api_enabled", value.toString());
                                setSettingsUpdated(true);
                            }}
                        />
                    </FormRow>
                </li>


            </ul>
        </BasicPage>
    );
}