import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow } from './common';
import { config, updateConfig } from "@/utils/config";
import { SwitchBox } from "@/components/switchBox"
import isDev from '@/utils/isDev';
import { IconButton } from '../iconButton';
import { SecretTextInput } from '../secretTextInput';
import { useContext, useEffect } from 'react';
import { ChatContext } from '@/features/chat/chatContext';
import { AmicaLifeContext } from '@/features/amicaLife/amicaLifeContext';


export function ExternalAPIPage({
    externalApiEnabled,
    setExternalApiEnabled,
    setSettingsUpdated,
}: {
    externalApiEnabled: boolean;
    setExternalApiEnabled: (amicaLifeEnabled: boolean) => void;
    setSettingsUpdated: (updated: boolean) => void;
}) {

    const { t } = useTranslation();
    const { chat: bot } = useContext(ChatContext);

    useEffect(() => {
        if (externalApiEnabled === true) {
            bot.initSSE();
        } else {
            bot.closeSSE();
        }
    }, [externalApiEnabled]);

    return (
        <BasicPage
            title={`${t("External API")} ${t("Settings")}`}
            description={`${t("Enables")} ${t("Only in development mode")}`}
        >
            <ul role="list" className="divide-y divide-gray-100 max-w-xs">
                <li className="py-4">
                    <FormRow label={`${t("Use")} ${t("External API")}`}>
                        <SwitchBox
                            value={externalApiEnabled}
                            label={`${t("External API")} ${t("Enabled")} ${t("(Disable to improve performance)")}`}
                            disabled={!isDev}
                            onChange={(value: boolean) => {
                                setExternalApiEnabled(value);
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