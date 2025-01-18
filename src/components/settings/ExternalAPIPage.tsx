import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow } from './common';
import { config, updateConfig } from "@/utils/config";
import { SwitchBox } from "@/components/switchBox"
import isDev from '@/utils/isDev';
import { IconButton } from '../iconButton';
import { SecretTextInput } from '../secretTextInput';


export function ExternalAPIPage({
    externalApiEnabled,
    xApiKey,
    xApiSecret,
    xAccessToken,
    xAccessSecret,
    xBearerToken,
    tgBotToken,
    setExternalApiEnabled,
    setXApiKey,
    setXApiSecret,
    setXAccessToken,
    setXAccessSecret,
    setXBearerToken,
    setTgBotToken,
    setSettingsUpdated,
}: {
    externalApiEnabled: boolean;
    xApiKey: string;
    xApiSecret: string;
    xAccessToken: string;
    xAccessSecret: string;
    xBearerToken: string;
    tgBotToken: string;
    setExternalApiEnabled: (amicaLifeEnabled: boolean) => void;
    setXApiKey: (key: string) => void;
    setXApiSecret: (key: string) => void;
    setXAccessToken: (key: string) => void;
    setXAccessSecret: (key: string) => void;
    setXBearerToken: (key: string) => void;
    setTgBotToken: (key: string) => void;
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
                {externalApiEnabled && (
                    <>

                        <li className="py-4">
                            <FormRow label="X API Key">
                                <SecretTextInput
                                    value={xApiKey}
                                    onChange={(event: React.ChangeEvent<any>) => {
                                        setXApiKey(event.target.value);
                                        updateConfig("x_api_key", event.target.value);
                                        setSettingsUpdated(true);
                                    }}
                                />
                            </FormRow>
                        </li>

                        <li className="py-4">
                            <FormRow label="X API Secret">
                                <SecretTextInput
                                    value={xApiSecret}
                                    onChange={(event: React.ChangeEvent<any>) => {
                                        setXApiSecret(event.target.value);
                                        updateConfig("x_api_secret", event.target.value);
                                        setSettingsUpdated(true);
                                    }}
                                />
                            </FormRow>
                        </li>

                        <li className="py-4">
                            <FormRow label="X Access Token">
                                <SecretTextInput
                                    value={xAccessToken}
                                    onChange={(event: React.ChangeEvent<any>) => {
                                        setXAccessToken(event.target.value);
                                        updateConfig("x_access_token", event.target.value);
                                        setSettingsUpdated(true);
                                    }}
                                />
                            </FormRow>
                        </li>

                        <li className="py-4">
                            <FormRow label="X Access Secret">
                                <SecretTextInput
                                    value={xAccessSecret}
                                    onChange={(event: React.ChangeEvent<any>) => {
                                        setXAccessSecret(event.target.value);
                                        updateConfig("x_access_secret", event.target.value);
                                        setSettingsUpdated(true);
                                    }}
                                />
                            </FormRow>
                        </li>

                        <li className="py-4">
                            <FormRow label="X Bearer Token">
                                <SecretTextInput
                                    value={xBearerToken}
                                    onChange={(event: React.ChangeEvent<any>) => {
                                        setXBearerToken(event.target.value);
                                        updateConfig("x_bearer_token", event.target.value);
                                        setSettingsUpdated(true);
                                    }}
                                />
                            </FormRow>
                        </li>

                        <li className="py-4">
                            <FormRow label="Telegram Bot Token">
                                <SecretTextInput
                                    value={tgBotToken}
                                    onChange={(event: React.ChangeEvent<any>) => {
                                        setTgBotToken(event.target.value);
                                        updateConfig("telegram_bot_token", event.target.value);
                                        setSettingsUpdated(true);
                                    }}
                                />
                            </FormRow>
                        </li>

                    </>
                )}

            </ul>
        </BasicPage>
    );
}